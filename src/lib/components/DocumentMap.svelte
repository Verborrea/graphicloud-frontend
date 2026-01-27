<script lang="ts">
	import type { Result } from '$lib/types';
	import { convexHull } from '$lib/utils';
	import * as d3 from 'd3';
	import WordCloud from './WordCloud.svelte';

	let { docs = [] }: { docs: Result[] } = $props();

	const width = 600;
	const height = 600;
	const padding = 100;

	const xScale = d3
		.scaleLinear()
		.domain([0, 1])
		.range([padding, width - padding]);
	const yScale = d3
		.scaleLinear()
		.domain([0, 1])
		.range([height - padding, padding]);

	let tooltip = $state({ x: 0, y: 0, visible: false, text: '', coords: [0, 0] });

	const hullPoints = $derived(docs.length >= 3 ? convexHull(docs) : []);

	const lineGenerator = d3
		.line<Result>()
		.x((d: any) => xScale(d.x))
		.y((d: any) => yScale(d.y))
		.curve(d3.curveLinearClosed);

	function handleMouseEnter(e: MouseEvent, filename: string, lat: number, lng: number) {
		tooltip = {
			x: e.clientX,
			y: e.clientY,
			visible: true,
			text: filename,
			coords: [lat, lng]
		};
	}

	function handleMouseMove(e: MouseEvent) {
		tooltip.x = e.clientX;
		tooltip.y = e.clientY;
	}

	function handleMouseLeave() {
		tooltip.visible = false;
	}
</script>

<div
	class="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-slate-50 p-4 shadow-inner"
>
	<svg viewBox="0 0 {width} {height}" class="h-auto w-full drop-shadow-sm">
		{#if hullPoints.length > 0}
			<path
				d={lineGenerator(hullPoints)}
				stroke-dasharray="5,5"
				class="pointer-events-none fill-blue-400/10 stroke-blue-500/30 stroke-3 opacity-50 transition-all duration-700 ease-in-out"
			/>
		{/if}

		{#each docs as d}
			<WordCloud keywords={d.keywords} x={xScale(d.x)} y={yScale(d.y)} />
		{/each}

		<g class="points">
			{#each docs as d}
				<circle
					cx={xScale(d.x)}
					cy={yScale(d.y)}
					r="6"
					class="hover:r-12 cursor-pointer fill-blue-600 transition-all hover:fill-blue-400"
					onmouseenter={(e) => handleMouseEnter(e, d.filename, d.x, d.y)}
					onmousemove={handleMouseMove}
					onmouseleave={handleMouseLeave}
					role="presentation"
				/>
				<!-- <text
					x={xScale(d.x)}
					y={yScale(d.y) + 18}
					text-anchor="middle"
					class="pointer-events-none fill-slate-400 text-[10px] font-medium"
				>
					{d.filename.slice(0, 10)}...
				</text> -->
			{/each}
		</g>
	</svg>

	{#if tooltip.visible}
		<div class="tooltip" style="left: {tooltip.x + 15}px; top: {tooltip.y - 15}px;">
			<span>{tooltip.text}</span>
			<span>x: {tooltip.coords[0].toFixed(2)},&nbsp;&nbsp;y: {tooltip.coords[1].toFixed(2)}</span>
		</div>
	{/if}
</div>

<style>
	circle {
		transition:
			r 0.2s ease,
			fill 0.2s ease;
	}
</style>
