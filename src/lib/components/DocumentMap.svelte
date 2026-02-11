<script lang="ts">
	import type { Result } from '$lib/types';
	import { convexHull } from '$lib/utils';
	import * as d3 from 'd3';
	import WordCloud from './WordCloud.svelte';
	import { fade } from 'svelte/transition';
	import Layers from './Layers.svelte';
	import Tooltip from './Tooltip.svelte';
	import FontSize from './FontSize.svelte';

	let { docs = [] }: { docs: Result[] } = $props();

	let minSize = $state(10);
	let maxSize = $state(32);
	let zoom = $state(600);

	let layers = $state({
		hull: true,
		clouds: true,
		points: true,
		bbs: true
	});

	const padding = 100;

	let xScale = $derived(
		d3
			.scaleLinear()
			.domain([0, 1])
			.range([padding, zoom - padding])
	);

	const yScale = $derived(
		d3
			.scaleLinear()
			.domain([0, 1])
			.range([zoom - padding, padding])
	);

	let tooltip = $state({ x: 0, y: 0, visible: false, text: '', coords: [0, 0] });
	const hullPoints = $derived(docs.length >= 3 ? convexHull(docs) : []);

	const lineGenerator = d3
		.line<Result>()
		.x((d: any) => xScale(d.x))
		.y((d: any) => yScale(d.y))
		.curve(d3.curveLinearClosed);
</script>

<div
	class="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-slate-50 p-4 shadow-inner"
>
	<FontSize bind:zoom bind:minSize bind:maxSize />
	<Layers bind:layers />
	<svg viewBox="0 0 {zoom} {zoom}" class="h-auto w-full drop-shadow-sm">
		{#if layers.hull && hullPoints.length > 0}
			<path
				transition:fade={{ duration: 300 }}
				d={lineGenerator(hullPoints)}
				stroke-dasharray="5,5"
				class="pointer-events-none fill-blue-400/10 stroke-blue-500/30 stroke-3 opacity-50 transition-all duration-700 ease-in-out"
			/>
		{/if}

		{#if layers.clouds}
			<g transition:fade={{ duration: 300 }}>
				{#each docs as d}
					<WordCloud
						keywords={d.keywords}
						x={xScale(d.x)}
						y={yScale(d.y)}
						showBoxes={layers.bbs}
						min={minSize}
						max={maxSize}
					/>
				{/each}
			</g>
		{/if}

		{#if layers.points}
			<g class="points" transition:fade={{ duration: 300 }}>
				{#each docs as d}
					<circle
						cx={xScale(d.x)}
						cy={yScale(d.y)}
						r="6"
						class="hover:r-12 cursor-pointer fill-blue-600 transition-all hover:fill-blue-400"
						onmouseenter={(e) =>
							(tooltip = {
								x: e.clientX,
								y: e.clientY,
								visible: true,
								text: d.filename,
								coords: [d.x, d.y]
							})}
						onmousemove={(e) => {
							tooltip.x = e.clientX;
							tooltip.y = e.clientY;
						}}
						onmouseleave={() => (tooltip.visible = false)}
						role="presentation"
					/>
				{/each}
			</g>
		{/if}
	</svg>

	{#if tooltip.visible}
		<Tooltip {tooltip} />
	{/if}
</div>

<style>
	circle {
		transition:
			r 0.2s ease,
			fill 0.2s ease;
	}
</style>
