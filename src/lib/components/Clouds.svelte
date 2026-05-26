<script lang="ts">
	import type { GCloud, GCNode, KeyWord } from '$lib/types';
	import * as d3 from 'd3';
	import WordCloud from './WordCloud.svelte';
	import {
		cloudBounds,
		convexHull,
		myWordle,
		placeSingleNodeInGlobalSpace,
		WORD_CLOUD_PALETTE
	} from '$lib/utils';
	import { measureWord } from '$lib/measureWord';
	import { api, gclouds, lasso, layers, mode, preferences, settings } from '$lib/state.svelte';

	let { width, height } = $props();

	const xScale = $derived(d3.scaleLinear().domain([0, 1]).range([0, width]));
	const yScale = $derived(d3.scaleLinear().domain([0, 1]).range([height, 0]));

	const locals = $derived(api.results?.locals ?? []);
	const hullPoints = $derived(locals.length >= 3 ? convexHull(locals) : []);

	const lineGenerator = $derived(
		d3
			.line<any>()
			.x((d) => xScale(d.x))
			.y((d) => yScale(d.y))
			.curve(d3.curveLinearClosed)
	);

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

	async function prepareNodes(keywords: KeyWord[], font: string): Promise<any[]> {
		const limited = keywords.slice(0, settings.keywordsCount);
		const scores = limited.map((k) => k.score);
		const minS = Math.min(...scores);
		const maxS = Math.max(...scores);

		const measured = await Promise.all(
			limited.map(async (kw) => {
				const fontSize =
					preferences.minFontSize +
					((kw.score - minS) / (maxS - minS || 1)) *
						(preferences.maxFontSize - preferences.minFontSize);

				const dims = await measureWord(kw.word, fontSize, font);

				return {
					id: crypto.randomUUID(),
					texts: [kw.word],
					score: kw.score,
					fontSize,
					w: dims.w,
					h: dims.h,
					ascent: dims.ascent
				};
			})
		);

		return measured.sort((a, b) => b.score - a.score);
	}

	async function buildClouds() {
		const results = api.results;
		if (!results) return;

		if (mode.mode === 'global') {
			const nodes = await myWordle(
				await prepareNodes(results.global, preferences.font),
				settings.algorithm,
				[]
			);
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

		const sortedLocals = [...results.locals].sort((a, b) => {
			if (!settings.sortByImportance) return 0;
			const scoreA = d3.sum(a.keywords, (d) => d.score);
			const scoreB = d3.sum(b.keywords, (d) => d.score);
			return scoreB - scoreA;
		});

		if (settings.generationMode === 'sequential') {
			// MODO SECUENCIAL
			const processed: GCloud[] = [];
			for (const doc of sortedLocals) {
				const myOffsetX = xScale(doc.x);
				const myOffsetY = yScale(doc.y);
				const obstacles = getObstaclesForCloud(myOffsetX, myOffsetY, processed);
				const nodes = await myWordle(
					await prepareNodes(doc.keywords, preferences.font),
					settings.algorithm,
					obstacles
				);
				const originalIndex = results.locals.findIndex((l) => l.filename === doc.filename);

				processed.push({
					id: doc.filename,
					color: WORD_CLOUD_PALETTE[originalIndex % WORD_CLOUD_PALETTE.length],
					offsetX: myOffsetX,
					offsetY: myOffsetY,
					nodes,
					radius: 0
				});
			}
			gclouds.locals = processed;
		} else {
			// MODO PARALELO SIMULTÁNEO
			const globalPlacedRects: { x: number; y: number; w: number; h: number }[] = [];

			const cloudBlueprints = await Promise.all(
				sortedLocals.map(async (doc) => {
					const originalIndex = results.locals.findIndex((l) => l.filename === doc.filename);
					return {
						id: doc.filename,
						offsetX: xScale(doc.x),
						offsetY: yScale(doc.y),
						color: WORD_CLOUD_PALETTE[originalIndex % WORD_CLOUD_PALETTE.length],
						pendingNodes: await prepareNodes(doc.keywords, preferences.font),
						nodes: [] as GCNode[]
					};
				})
			);

			const maxIter = Math.max(...cloudBlueprints.map((c) => c.pendingNodes.length));

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

			gclouds.locals = cloudBlueprints.map((b) => ({
				id: b.id,
				color: b.color,
				offsetX: b.offsetX,
				offsetY: b.offsetY,
				nodes: b.nodes,
				radius: 0
			}));
		}
	}

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

			cloud.nodes = myWordle([...remaining, iconNode], settings.algorithm, obstacles);
		}

		lasso.words = [];
		lasso.lassoPoints = [];
		lasso.svg = undefined;
	}

	$effect(() => {
		buildClouds();
	});

	$effect(() => {
		if (!lasso.svg) return;
		replaceSelectionWithIcon();
	});

	// async function createNodes(
	// 	keywords: KeyWord[],
	// 	font: string,
	// 	obstacles: { x: number; y: number; w: number; h: number }[]
	// ): Promise<GCNode[]> {
	// 	const limited = keywords.slice(0, settings.keywordsCount);
	// 	const algorithm = settings.algorithm;
	// 	const scores = limited.map((k) => k.score);
	// 	const minS = Math.min(...scores);
	// 	const maxS = Math.max(...scores);

	// 	const measured = await Promise.all(
	// 		limited.map(async (kw) => {
	// 			const fontSize =
	// 				preferences.minFontSize +
	// 				((kw.score - minS) / (maxS - minS || 1)) *
	// 					(preferences.maxFontSize - preferences.minFontSize);

	// 			const dims = await measureWord(kw.word, fontSize, font);

	// 			return {
	// 				id: crypto.randomUUID(),
	// 				texts: [kw.word],
	// 				score: kw.score,
	// 				fontSize,
	// 				w: dims.w,
	// 				h: dims.h,
	// 				ascent: dims.ascent
	// 			};
	// 		})
	// 	);

	// 	return myWordle(measured, algorithm, obstacles);
	// }

	// async function buildClouds() {
	// 	const results = api.results;

	// 	if (!results) return;

	// 	if (mode.mode === 'global') {
	// 		const nodes = await createNodes(results.global, preferences.font, []);

	// 		gclouds.global = {
	// 			id: 'global',
	// 			color: WORD_CLOUD_PALETTE[0],
	// 			offsetX: width / 2,
	// 			offsetY: height / 2,
	// 			nodes,
	// 			radius: 0
	// 		};
	// 	} else {
	// 		const processed: GCloud[] = [];
	// 		for (const [index, doc] of results.locals.entries()) {
	// 			const myOffsetX = xScale(doc.x);
	// 			const myOffsetY = yScale(doc.y);

	// 			const obstacles = processed.map((cloud) => {
	// 				const bounds = cloudBounds(cloud.nodes);
	// 				return {
	// 					x: cloud.offsetX - myOffsetX + bounds.x,
	// 					y: cloud.offsetY - myOffsetY + bounds.y,
	// 					w: bounds.w,
	// 					h: bounds.h
	// 				};
	// 			});

	// 			const nodes = await createNodes(doc.keywords, preferences.font, obstacles);

	// 			processed.push({
	// 				id: doc.filename,
	// 				color: WORD_CLOUD_PALETTE[index % WORD_CLOUD_PALETTE.length],
	// 				offsetX: myOffsetX,
	// 				offsetY: myOffsetY,
	// 				nodes,
	// 				radius: 0
	// 			});
	// 		}

	// 		gclouds.locals = processed;
	// 	}
	// }

	// async function replaceSelectionWithIcon() {
	// 	const selected = [...lasso.words];

	// 	if (selected.length === 0) return;

	// 	const grouped = new Map<
	// 		string,
	// 		{
	// 			words: string[];
	// 			score: number;
	// 		}
	// 	>();

	// 	for (const w of selected) {
	// 		if (!grouped.has(w.cloudId)) {
	// 			grouped.set(w.cloudId, {
	// 				words: [],
	// 				score: 0
	// 			});
	// 		}

	// 		const entry = grouped.get(w.cloudId)!;

	// 		entry.words.push(w.word);
	// 		entry.score += w.score;
	// 	}

	// 	if (gclouds.global) {
	// 		const selection = grouped.get('global');

	// 		if (selection) {
	// 			const remaining = gclouds.global.nodes.filter(
	// 				(node) => !node.texts.some((t) => selection.words.includes(t))
	// 			);

	// 			const fontSize = Math.max(
	// 				preferences.minFontSize,
	// 				Math.min(preferences.maxFontSize * 2, selection.score * 100)
	// 			);

	// 			const iconNode: GCNode = {
	// 				id: crypto.randomUUID(),
	// 				texts: selection.words,
	// 				icon: lasso.svg,
	// 				score: selection.score,
	// 				fontSize,
	// 				w: fontSize,
	// 				h: fontSize,
	// 				x: 0,
	// 				y: 0,
	// 				ascent: 0
	// 			};

	// 			gclouds.global.nodes = myWordle([...remaining, iconNode], settings.algorithm);
	// 		}
	// 	}

	// 	for (const cloud of gclouds.locals) {
	// 		const selection = grouped.get(cloud.id);

	// 		if (!selection) continue;

	// 		const remaining = cloud.nodes.filter(
	// 			(node) => !node.texts.some((t) => selection.words.includes(t))
	// 		);

	// 		const fontSize = Math.max(
	// 			preferences.minFontSize,
	// 			Math.min(preferences.maxFontSize * 2, selection.score * 100)
	// 		);

	// 		const iconNode: GCNode = {
	// 			id: crypto.randomUUID(),
	// 			texts: selection.words,
	// 			icon: lasso.svg,
	// 			score: selection.score,
	// 			fontSize,
	// 			w: fontSize,
	// 			h: fontSize,
	// 			x: 0,
	// 			y: 0,
	// 			ascent: 0
	// 		};

	// 		cloud.nodes = myWordle([...remaining, iconNode], settings.algorithm);
	// 	}

	// 	lasso.words = [];
	// 	lasso.lassoPoints = [];
	// 	lasso.svg = undefined;
	// }

	// $effect(() => {
	// 	buildClouds();
	// });

	// $effect(() => {
	// 	if (!lasso.svg) return;
	// 	replaceSelectionWithIcon();
	// });
</script>

{#if api.results}
	{#if mode.mode === 'global'}
		<WordCloud cloudId="global" isGlobal={true} offsetX={width / 2} offsetY={height / 2} />
	{:else}
		{#if layers.hull && hullPoints.length > 0}
			<path
				d={lineGenerator(hullPoints)}
				class="pointer-events-none fill-blue-400/10 stroke-blue-500/30 stroke-[4px]"
				style="stroke-dasharray: 10,10"
			/>
		{/if}

		{#each locals as doc}
			<WordCloud cloudId={doc.filename} offsetX={xScale(doc.x)} offsetY={yScale(doc.y)} />
		{/each}
	{/if}
{/if}
