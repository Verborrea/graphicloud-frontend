<script lang="ts">
	import { configState, cloudState, lassoState } from '$lib/state.svelte';
	import { convexHull, myWordle, WORD_CLOUD_PALETTE } from '$lib/utils';
	import { measureWord } from '$lib/measureWord';
	import WordCloud from './WordCloud.svelte';
	import * as d3 from 'd3';

	const xScale = $derived(d3.scaleLinear().domain([0, 1]).range([0, configState.range]));
	const yScale = $derived(d3.scaleLinear().domain([0, 1]).range([configState.range, 0]));

	const locals = $derived(configState.results?.locals ?? []);
	const hullPoints = $derived(locals.length >= 3 ? convexHull(locals) : []);

	const lineGenerator = $derived(
		d3
			.line<any>()
			.x((d) => xScale(d.x))
			.y((d) => yScale(d.y))
			.curve(d3.curveLinearClosed)
	);

	$effect(() => {
		const results = configState.results;
		if (!results) return;

		async function processAll() {
			if (!results) return;

			if (configState.global) {
				const ox = configState.range / 2;
				const oy = configState.range / 2;
				const nodes = await prepareCloud(
					results.global,
					'global',
					configState.range / 2,
					configState.range / 2
				);
				cloudState.global = {
					nodes,
					color: WORD_CLOUD_PALETTE[0],
					ox,
					oy
				};
			} else {
				const processedLocals = await Promise.all(
					results.locals.map(async (doc, index) => {
						const id = doc.filename;
						const ox = xScale(doc.x);
						const oy = yScale(doc.y);
						const nodes = await prepareCloud(doc.keywords, id, xScale(doc.x), yScale(doc.y));
						const color = WORD_CLOUD_PALETTE[index % WORD_CLOUD_PALETTE.length];
						return { id, nodes, color, ox, oy };
					})
				);
				cloudState.locals = processedLocals;
			}
		}

		async function prepareCloud(keywords: any[], cloudId: string, ox: number, oy: number) {
			const words = keywords.slice(0, configState.keywordsCount);
			if (words.length === 0) return [];

			const scores = words.map((w) => w.score);
			const minS = Math.min(...scores);
			const maxS = Math.max(...scores);

			const measured = await Promise.all(
				words.map(async (kw) => {
					const fontSize =
						configState.minFontSize +
						((kw.score - minS) / (maxS - minS || 1)) *
							(configState.maxFontSize - configState.minFontSize);

					const dims = await measureWord(kw.word, fontSize, configState.font);
					return { ...kw, ...dims, fontSize, text: kw.word };
				})
			);

			const positioned = myWordle(measured, configState.algorithm);

			return positioned;
		}

		processAll();
	});
</script>

{#if configState.global}
	<g transform="translate({configState.range / 2}, {configState.range / 2})">
		<WordCloud cloudId="global" isGlobal={true} />
	</g>
{:else}
	{#if configState.layers.hull && hullPoints.length > 0}
		<path
			d={lineGenerator(hullPoints)}
			class="pointer-events-none fill-blue-400/10 stroke-blue-500/30 stroke-[4px]"
			style="stroke-dasharray: 10,10"
		/>
	{/if}

	{#each locals as doc}
		<g transform="translate({xScale(doc.x)}, {yScale(doc.y)})">
			<WordCloud cloudId={doc.filename} />
		</g>
	{/each}

	{#if configState.layers.docs}
		{#each locals as doc}
			<circle cx={xScale(doc.x)} cy={yScale(doc.y)} r="8" class="fill-blue-600" />
		{/each}
	{/if}
{/if}
