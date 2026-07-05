<script lang="ts">
	import type { GCloud, GCNode, KeyWord } from '$lib/types';
	import * as d3 from 'd3';
	import WordCloud from './WordCloud.svelte';
	import {
		cloudBounds,
		myWordle,
		placeSingleNodeInGlobalSpace,
		WORD_CLOUD_PALETTE
	} from '$lib/utils';
	import { measureWord } from '$lib/measureWord';
	import { api, gclouds, lasso, mode, preferences, settings } from '$lib/state.svelte';
	import ConvexHull from './ConvexHull.svelte';

	let { width, height } = $props();

	const xScale = $derived(d3.scaleLinear().domain([0, 1]).range([0, width]));
	const yScale = $derived(d3.scaleLinear().domain([0, 1]).range([height, 0]));
	const locals = $derived(api.results?.locals ?? []);

	const ICON_SIZE_MULTIPLIER = 1.5;
	const OUTLIER_COLOR = '#9ca3af'; // documentos que HDBSCAN marca como ruido (-1)

	// ── Token anti-stale ──────────────────────────────────────────────────────
	// buildClouds es async y sin cancelación: si cambias iconsCount de 5 -> 0,
	// el build de "0" (sin fetch, instantáneo) termina ANTES que el build de "5"
	// (que espera la red), y este último sobreescribía gclouds con íconos.
	// Ese era el bug. Cada build lleva un id; solo el más reciente puede
	// escribir en gclouds.
	let buildId = 0;

	// ── Cache de íconos en cliente ────────────────────────────────────────────
	// Cada keyword resuelta queda memoizada: subir/bajar iconsCount no vuelve
	// a tocar la red para keywords ya vistas.
	const iconCache = new Map<string, string | null>();
	const iconKey = (kw: KeyWord) => `${kw.word.toLowerCase()}|${kw.score.toFixed(4)}`;

	/**
	 * Resuelve los SVGs de un conjunto de keywords con UNA sola llamada HTTP
	 * (solo para las que no están en cache). Devuelve Map<iconKey, svg|null>.
	 */
	async function fetchIcons(keywords: KeyWord[]): Promise<Map<string, string | null>> {
		const out = new Map<string, string | null>();
		const missing = new Map<string, KeyWord>(); // deduplicado por key

		for (const kw of keywords) {
			const key = iconKey(kw);
			if (iconCache.has(key)) {
				out.set(key, iconCache.get(key)!);
			} else if (!missing.has(key)) {
				missing.set(key, kw);
			}
		}

		if (missing.size === 0) return out;

		try {
			const groups = [...missing.values()].map((kw) => [{ word: kw.word, score: kw.score }]);
			const res = await fetch('http://localhost:8000/select-icons-batch/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ groups })
			});

			if (res.ok) {
				const data = await res.json();
				[...missing.entries()].forEach(([key, kw], i) => {
					const svg: string | null = data.icons[i]?.svg ?? null;
					iconCache.set(key, svg); // se cachean también los null: "sin match" es una respuesta válida
					out.set(key, svg);
					if (!svg) console.warn(`Sin ícono para "${kw.word}":`, data.icons[i]?.error);
				});
			} else {
				// Error HTTP: no cachear, para reintentar en el próximo build.
				for (const key of missing.keys()) out.set(key, null);
			}
		} catch (err) {
			console.error('Error obteniendo lote de íconos:', err);
			for (const key of missing.keys()) out.set(key, null);
		}

		return out;
	}

	// ── Color por cluster ─────────────────────────────────────────────────────
	function cloudColor(filename: string): string {
		const docs = api.results?.locals ?? [];
		const idx = docs.findIndex((l) => l.filename === filename);

		if (settings.clusterize) {
			const cluster = idx >= 0 ? docs[idx].cluster : null;
			if (cluster == null || cluster < 0) return OUTLIER_COLOR;
			return WORD_CLOUD_PALETTE[cluster % WORD_CLOUD_PALETTE.length];
		}
		return WORD_CLOUD_PALETTE[(idx >= 0 ? idx : 0) % WORD_CLOUD_PALETTE.length];
	}

	// ── Construcción de nodos ─────────────────────────────────────────────────
	function topKeywords(keywords: KeyWord[]) {
		const limited = keywords.slice(0, settings.keywordsCount);
		const sorted = [...limited].sort((a, b) => b.score - a.score);
		const iconCount = settings.iconsCount > 0 ? Math.min(settings.iconsCount, sorted.length) : 0;
		return { sorted, forIcons: sorted.slice(0, iconCount) };
	}

	async function prepareNodes(
		sorted: KeyWord[],
		iconCount: number,
		icons: Map<string, string | null>,
		font: string
	): Promise<any[]> {
		if (sorted.length === 0) return [];

		const scores = sorted.map((k) => k.score);
		const minS = Math.min(...scores);
		const maxS = Math.max(...scores);

		const measured = await Promise.all(
			sorted.map(async (kw, index) => {
				const fontSize =
					preferences.minFontSize +
					((kw.score - minS) / (maxS - minS || 1)) *
						(preferences.maxFontSize - preferences.minFontSize);

				const iconSvg = index < iconCount ? (icons.get(iconKey(kw)) ?? null) : null;

				let w = fontSize * ICON_SIZE_MULTIPLIER;
				let h = fontSize * ICON_SIZE_MULTIPLIER;
				let ascent = 0;

				if (!iconSvg) {
					const dims = await measureWord(kw.word, fontSize, font);
					w = dims.w;
					h = dims.h;
					ascent = dims.ascent;
				}

				return {
					id: crypto.randomUUID(),
					texts: [kw.word],
					score: kw.score,
					fontSize: iconSvg ? fontSize * ICON_SIZE_MULTIPLIER : fontSize,
					w,
					h,
					ascent,
					icon: iconSvg || undefined
				};
			})
		);

		return measured.sort((a, b) => b.score - a.score);
	}

	function getObstaclesForCloud(
		targetOffsetX: number,
		targetOffsetY: number,
		otherClouds: GCloud[]
	) {
		return otherClouds
			.filter((cloud) => cloud.nodes && cloud.nodes.length > 0)
			.map((cloud) => {
				const bounds = cloudBounds(cloud.nodes);
				return {
					x: cloud.offsetX - targetOffsetX + bounds.x,
					y: cloud.offsetY - targetOffsetY + bounds.y,
					w: bounds.w,
					h: bounds.h
				};
			});
	}

	// ── Build principal ───────────────────────────────────────────────────────
	async function buildClouds(id: number) {
		const results = api.results;
		if (!results) {
			console.log('[DEBUG-1] sin results, abortando');
			return;
		}

		const isStale = () => id !== buildId;

		// ----- Modo global: una nube, una llamada (con cache) -----
		if (mode.mode === 'global') {
			const { sorted, forIcons } = topKeywords(results.global);
			const icons = await fetchIcons(forIcons);
			if (isStale()) return;

			const prepared = await prepareNodes(sorted, forIcons.length, icons, preferences.font);
			const nodes = await myWordle(prepared, settings.algorithm, []);
			if (isStale()) return;

			gclouds.global = {
				id: 'global',
				color: WORD_CLOUD_PALETTE[0],
				offsetX: width / 2,
				offsetY: height / 2,
				nodes,
				radius: 0
			};
			return;
		}

		console.log('[DEBUG-2] entrando a modo local, locals.length:', results.locals.length);

		// ----- Modo local -----
		const sortedLocals = [...results.locals].sort((a, b) => {
			if (!settings.sortByImportance) return 0;
			const scoreA = d3.sum(a.keywords, (d) => d.score);
			const scoreB = d3.sum(b.keywords, (d) => d.score);
			return scoreB - scoreA;
		});

		// UNA SOLA llamada HTTP para los íconos de TODAS las nubes.
		// Antes: 1 fetch por nube (100 nubes = 100 requests). Ahora los grupos
		// de todos los documentos se juntan, se deduplican contra el cache y
		// viajan en un único batch.
		const perDoc = sortedLocals.map((doc) => ({ doc, ...topKeywords(doc.keywords) }));
		const allIconKeywords = perDoc.flatMap((p) => p.forIcons);
		console.log(
			'[DEBUG-3] allIconKeywords.length:',
			allIconKeywords.length,
			'iconsCount setting:',
			settings.iconsCount
		);

		const icons = await fetchIcons(allIconKeywords);
		if (isStale()) {
			console.log('[DEBUG-4] stale después de fetchIcons, abortando');
			return;
		}
		console.log('[DEBUG-4] fetchIcons resuelto, icons.size:', icons.size);

		if (settings.generationMode === 'sequential') {
			const processed: GCloud[] = [];

			for (const { doc, sorted, forIcons } of perDoc) {
				const myOffsetX = xScale(doc.x);
				const myOffsetY = yScale(doc.y);
				const obstacles = getObstaclesForCloud(myOffsetX, myOffsetY, processed);

				const prepared = await prepareNodes(sorted, forIcons.length, icons, preferences.font);
				const nodes = await myWordle(prepared, settings.algorithm, obstacles);
				if (isStale()) return; // abortar a mitad de lote si llegó un build más nuevo

				processed.push({
					id: doc.filename,
					color: cloudColor(doc.filename),
					offsetX: myOffsetX,
					offsetY: myOffsetY,
					nodes,
					radius: 0
				});
			}

			if (isStale()) return;
			gclouds.locals = processed;
		} else {
			// MODO PARALELO SIMULTÁNEO
			const globalPlacedRects: { x: number; y: number; w: number; h: number }[] = [];

			const cloudBlueprints = await Promise.all(
				perDoc.map(async ({ doc, sorted, forIcons }) => ({
					id: doc.filename,
					offsetX: xScale(doc.x),
					offsetY: yScale(doc.y),
					color: cloudColor(doc.filename),
					pendingNodes: await prepareNodes(sorted, forIcons.length, icons, preferences.font),
					nodes: [] as GCNode[]
				}))
			);
			if (isStale()) return;

			const maxIter = Math.max(0, ...cloudBlueprints.map((c) => c.pendingNodes.length));

			for (let round = 0; round < maxIter; round++) {
				for (const blueprint of cloudBlueprints) {
					if (blueprint.pendingNodes.length > 0) {
						const nextNode = blueprint.pendingNodes.shift();

						const placedNode = placeSingleNodeInGlobalSpace(
							nextNode,
							blueprint.offsetX,
							blueprint.offsetY,
							globalPlacedRects,
							settings.algorithm
						);

						if (placedNode) {
							blueprint.nodes.push(placedNode);
						}
					}
				}
			}

			if (isStale()) return;
			gclouds.locals = cloudBlueprints.map((b) => ({
				id: b.id,
				color: b.color,
				offsetX: b.offsetX,
				offsetY: b.offsetY,
				nodes: b.nodes,
				radius: 0
			}));
		}
		console.log('[DEBUG-5] terminó buildClouds, gclouds.locals.length:', gclouds.locals.length);
	}

	// ── Lasso -> ícono ────────────────────────────────────────────────────────
	async function replaceSelectionWithIcon() {
		const selected = [...lasso.words];
		if (selected.length === 0) return;

		const grouped = new Map<string, { words: string[]; score: number }>();
		for (const w of selected) {
			if (!grouped.has(w.cloudId)) grouped.set(w.cloudId, { words: [], score: 0 });
			const entry = grouped.get(w.cloudId)!;
			entry.words.push(w.word);
			entry.score += w.score;
		}

		for (const cloud of gclouds.locals) {
			const selection = grouped.get(cloud.id);
			if (!selection) continue;

			const remaining = cloud.nodes.filter(
				(node) => !node.texts.some((t) => selection.words.includes(t))
			);

			const fontSize = Math.max(
				preferences.minFontSize,
				Math.min(preferences.maxFontSize * 2, selection.score * 100)
			);

			const iconNode: GCNode = {
				id: crypto.randomUUID(),
				texts: selection.words,
				icon: lasso.svg,
				score: selection.score,
				fontSize,
				w: fontSize,
				h: fontSize,
				x: 0,
				y: 0,
				ascent: 0
			};

			const otherClouds = gclouds.locals.filter((c) => c.id !== cloud.id);
			const obstacles = getObstaclesForCloud(cloud.offsetX, cloud.offsetY, otherClouds);

			// Bug previo: myWordle devuelve una Promise y se asignaba sin await,
			// dejando cloud.nodes como Promise en vez de array.
			cloud.nodes = await myWordle([...remaining, iconNode], settings.algorithm, obstacles);
		}

		lasso.words = [];
		lasso.lassoPoints = [];
		lasso.svg = undefined;
	}

	// ── Effects ───────────────────────────────────────────────────────────────
	// Las dependencias se leen SÍNCRONAMENTE aquí. Svelte 5 solo trackea lo
	// leído antes del primer await: cualquier lectura dentro de buildClouds
	// posterior a un await es invisible para el effect. Por eso la lista
	// explícita (lo que tenías comentado era la intención correcta).
	$effect(() => {
		settings.algorithm;
		settings.generationMode;
		settings.keywordsCount;
		settings.iconsCount;
		settings.sortByImportance;
		mode.mode;
		preferences.font;
		preferences.minFontSize;
		preferences.maxFontSize;
		api.results;
		width;
		height;

		console.log('efecto');

		const myId = ++buildId; // invalida cualquier build en vuelo
		buildClouds(myId);
	});

	// Cambiar clusterize SOLO recolorea: no reconstruye nubes ni toca la red.
	$effect(() => {
		settings.clusterize;
		for (const cloud of gclouds.locals) {
			cloud.color = cloudColor(cloud.id);
		}
	});

	$effect(() => {
		if (!lasso.svg) return;
		replaceSelectionWithIcon();
	});
</script>

{#if api.results}
	{#if mode.mode === 'global'}
		<WordCloud cloudId="global" isGlobal={true} offsetX={width / 2} offsetY={height / 2} />
	{:else}
		<ConvexHull {xScale} {yScale} {locals} />
		{#each locals as doc}
			<WordCloud cloudId={doc.filename} offsetX={xScale(doc.x)} offsetY={yScale(doc.y)} />
		{/each}
	{/if}
{/if}
