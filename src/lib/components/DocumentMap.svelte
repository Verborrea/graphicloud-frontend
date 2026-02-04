<script lang="ts">
	import type { Result } from '$lib/types';
	import { convexHull } from '$lib/utils';
	import * as d3 from 'd3';
	import WordCloud from './WordCloud.svelte';
	import { fade } from 'svelte/transition';
	import { Eye, EyeClosed, Layers } from '@lucide/svelte';

	let { docs = [] }: { docs: Result[] } = $props();

	let layers = $state({
		hull: true,
		clouds: true,
		points: true,
		bbs: true
	});

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

	function toggleLayer(layer: keyof typeof layers) {
		layers[layer] = !layers[layer];
	}
</script>

<div
	class="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-slate-50 p-4 shadow-inner"
>
	<div
		class="absolute top-4 right-4 z-10 flex flex-col gap-2 rounded-lg border border-gray-200 bg-white/80 p-2 shadow-sm backdrop-blur-md"
	>
		<div class="mb-1 flex items-center gap-2 px-1 text-[10px] font-bold text-gray-400 uppercase">
			<Layers size="12" /> LAYERS
		</div>

		<button onclick={() => toggleLayer('hull')} class="layer-btn" class:active={layers.hull}>
			{#if layers.hull}
				<Eye size={16} />
			{:else}
				<EyeClosed size={16} />
			{/if} Hull
		</button>

		<button onclick={() => toggleLayer('clouds')} class="layer-btn" class:active={layers.clouds}>
			{#if layers.clouds}
				<Eye size={16} />
			{:else}
				<EyeClosed size={16} />
			{/if} Clouds
		</button>

		<button onclick={() => toggleLayer('points')} class="layer-btn" class:active={layers.points}>
			{#if layers.points}
				<Eye size={16} />
			{:else}
				<EyeClosed size={16} />
			{/if}
			Docs
		</button>

		<button onclick={() => toggleLayer('bbs')} class="layer-btn" class:active={layers.bbs}>
			{#if layers.bbs}
				<Eye size={16} />
			{:else}
				<EyeClosed size={16} />
			{/if}
			BBS
		</button>
	</div>

	<svg viewBox="0 0 {width} {height}" class="h-auto w-full drop-shadow-sm">
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
					<WordCloud keywords={d.keywords} x={xScale(d.x)} y={yScale(d.y)} showBoxes={layers.bbs} />
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
		<div
			class="tooltip pointer-events-none fixed z-50 rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white shadow-xl"
			style="left: {tooltip.x + 15}px; top: {tooltip.y - 15}px;"
		>
			<div class="font-bold">{tooltip.text}</div>
			<div class="text-[10px] opacity-60">
				x: {tooltip.coords[0].toFixed(3)} y: {tooltip.coords[1].toFixed(3)}
			</div>
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
