<script lang="ts">
	import * as d3 from 'd3';
	import WordCloud from './WordCloud.svelte';
	import { convexHull, myWordle, WORD_CLOUD_PALETTE } from '$lib/utils';
	import { measureWord } from '$lib/measureWord';
	import { api, gclouds, lasso, layers, mode, preferences, settings } from '$lib/state.svelte';
	import type { GCloud, GCNode, KeyWord } from '$lib/types';

	const xScale = $derived(d3.scaleLinear().domain([0, 1]).range([0, 1000]));
	const yScale = $derived(d3.scaleLinear().domain([0, 1]).range([1000, 0]));

	const locals = $derived(api.results?.locals ?? []);
	const hullPoints = $derived(locals.length >= 3 ? convexHull(locals) : []);

	const lineGenerator = $derived(
		d3
			.line<any>()
			.x((d) => xScale(d.x))
			.y((d) => yScale(d.y))
			.curve(d3.curveLinearClosed)
	);

	async function createNodes(keywords: KeyWord[], font: string): Promise<GCNode[]> {
		const limited = keywords.slice(0, settings.keywordsCount);
		const algorithm = settings.algorithm;

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
					h: dims.h
				};
			})
		);

		return myWordle(measured, algorithm);
	}

	async function buildClouds() {
		const results = api.results;

		if (!results) return;

		if (mode.mode === 'global') {
			const nodes = await createNodes(results.global, preferences.font);

			gclouds.global = {
				id: 'global',
				color: WORD_CLOUD_PALETTE[0],
				offsetX: 500,
				offsetY: 500,
				nodes
			};
		} else {
			const processed: GCloud[] = await Promise.all(
				results.locals.map(async (doc: any, index: number) => {
					const nodes = await createNodes(doc.keywords, preferences.font);

					return {
						id: doc.filename,
						color: WORD_CLOUD_PALETTE[index % WORD_CLOUD_PALETTE.length],
						offsetX: xScale(doc.x),
						offsetY: yScale(doc.y),
						nodes
					};
				})
			);

			gclouds.locals = processed;
		}
	}

	async function replaceSelectionWithIcon() {
		const selected = [...lasso.words];

		if (selected.length === 0) return;

		const grouped = new Map<
			string,
			{
				words: string[];
				score: number;
			}
		>();

		for (const w of selected) {
			if (!grouped.has(w.cloudId)) {
				grouped.set(w.cloudId, {
					words: [],
					score: 0
				});
			}

			const entry = grouped.get(w.cloudId)!;

			entry.words.push(w.word);
			entry.score += w.score;
		}

		if (gclouds.global) {
			const selection = grouped.get('global');

			if (selection) {
				const remaining = gclouds.global.nodes.filter(
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
					y: 0
				};

				gclouds.global.nodes = myWordle([...remaining, iconNode], settings.algorithm);
			}
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
				y: 0
			};

			cloud.nodes = myWordle([...remaining, iconNode], settings.algorithm);
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
</script>

{#if api.results}
	{#if mode.mode === 'global'}
		<WordCloud cloudId="global" isGlobal={true} offsetX={500} offsetY={500} />
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

		{#if layers.docs}
			{#each locals as doc}
				<circle cx={xScale(doc.x)} cy={yScale(doc.y)} r="8" class="fill-blue-600" />
			{/each}
		{/if}
	{/if}
{/if}
