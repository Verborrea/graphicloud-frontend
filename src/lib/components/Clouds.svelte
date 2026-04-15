<!-- <script lang="ts">
	import { onMount } from 'svelte';
	import { configState } from '$lib/state.svelte';
	import { measureWord } from '$lib/measureWord';
	import { myWordle } from '$lib/utils';

	const initial = [
		{ id: 1, text: 'Hola mundo', fontSize: 24, score: 100 },
		{ id: 2, text: 'Svelte 5', fontSize: 32, score: 150 },
		{ id: 3, text: 'Canvas API', fontSize: 64, score: 200 },
		{ id: 4, text: 'Visualización', fontSize: 18, score: 50 }
	];

	let nodes = $state<any[]>([]);

	onMount(async () => {
		// 1. Medir todas las palabras primero (Async)
		const measured = await Promise.all(
			initial.map(async (n) => {
				const dimensions = await measureWord(n.text, n.fontSize, configState.font);
				return { ...n, ...dimensions };
			})
		);

		// 2. Calcular posiciones con el algoritmo (Sync)
		const positioned = myWordle(measured, 'mani');

		nodes = positioned.map((n) => ({
			...n,
			x: n.x,
			y: n.y,
			rectX: n.rectX,
			rectY: n.rectY
		}));
	});
</script>

{#each nodes as node (node.id)}
	{#if configState.layers.bb}
		<rect
			x={node.x}
			y={node.y - node.ascent}
			width={node.width}
			height={node.height}
			fill="none"
			stroke="#3b82f6"
			stroke-width="0.5"
		/>
	{/if}

	<text x={node.x} y={node.y} font-size={node.fontSize} font-family={configState.font} fill="#111">
		{node.text}
	</text>
{/each} -->

<script lang="ts">
	import { configState, cloudState, lassoState } from '$lib/state.svelte';
	import { convexHull, myWordle } from '$lib/utils';
	import { measureWord } from '$lib/measureWord';
	import WordCloud from './WordCloud.svelte';
	import * as d3 from 'd3';

	let { onHover, onMove, onLeave, svgEl = $bindable(null) } = $props();

	// Escalas
	const xScale = $derived(d3.scaleLinear().domain([0, 1]).range([0, configState.range]));
	const yScale = $derived(d3.scaleLinear().domain([0, 1]).range([configState.range, 0]));

	// Datos derivados para visualización
	const locals = $derived(configState.results?.locals ?? []);
	const globals = $derived(configState.results?.global ?? []);
	const hullPoints = $derived(locals.length >= 3 ? convexHull(locals) : []);

	const lineGenerator = $derived(
		d3
			.line<any>()
			.x((d) => xScale(d.x))
			.y((d) => yScale(d.y))
			.curve(d3.curveLinearClosed)
	);

	// Lógica de procesamiento de nubes
	$effect(() => {
		const results = configState.results;
		if (!results) return;

		async function processAll() {
			if (!results) return;
			// Limpiar mapa de lasso al empezar
			lassoState.placedWordsMap = {};

			if (configState.global) {
				const nodes = await prepareCloud(
					results.global,
					'global',
					configState.range / 2,
					configState.range / 2
				);
				cloudState.global = nodes;
			} else {
				const processedLocals = await Promise.all(
					results.locals.map(async (doc) => {
						const id = doc.filename;
						const nodes = await prepareCloud(doc.keywords, id, xScale(doc.x), yScale(doc.y));
						return { id, nodes };
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

			// 1. Medir
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

			// 2. Posicionar
			const positioned = myWordle(measured, configState.algorithm);

			// 3. Registrar en LassoState (coordenadas absolutas para el lazo)
			lassoState.placedWordsMap[cloudId] = positioned.map((n) => ({
				text: n.text,
				score: n.score,
				x: ox + n.x,
				y: oy + n.y
			}));

			return positioned;
		}

		processAll();
	});
</script>

<svg
	bind:this={svgEl}
	viewBox="0 0 {configState.range} {configState.range}"
	class="pointer-events-auto h-200 w-200 overflow-visible"
>
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
				<circle
					cx={xScale(doc.x)}
					cy={yScale(doc.y)}
					r="8"
					class="cursor-pointer fill-blue-600 transition-colors hover:fill-orange-500"
					onmouseenter={(e) => onHover(e, doc)}
					onmousemove={onMove}
					onmouseleave={onLeave}
					role="presentation"
				/>
			{/each}
		{/if}
	{/if}
</svg>
