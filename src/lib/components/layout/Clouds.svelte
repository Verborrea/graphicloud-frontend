<script lang="ts">
	import { cloudState } from '$lib/state.svelte';
	import { convexHull } from '$lib/utils';
	import NewWordCloud from '../NewWordCloud.svelte';
	import * as d3 from 'd3';

	let { onHover, onMove, onLeave, svgEl = $bindable<SVGSVGElement | null>(null) } = $props();

	const locals = $derived(cloudState.results?.locals ?? []);
	const globals = $derived(cloudState.results?.global ?? []);
	const hullPoints = $derived(locals.length >= 3 ? convexHull(locals) : []);

	const lineGenerator = $derived(
		d3
			.line<any>()
			.x((d) => xScale(d.x))
			.y((d) => yScale(d.y))
			.curve(d3.curveLinearClosed)
	);

	const xScale = $derived(d3.scaleLinear().domain([0, 1]).range([0, cloudState.range]));
	const yScale = $derived(d3.scaleLinear().domain([0, 1]).range([cloudState.range, 0]));
</script>

<svg
	bind:this={svgEl}
	viewBox="0 0 {cloudState.range} {cloudState.range}"
	class="pointer-events-auto h-200 w-200 overflow-visible"
>
	{#if cloudState.global}
		{#if cloudState.layers.wc}
			<g transform="translate({cloudState.range / 2}, {cloudState.range / 2})">
				<NewWordCloud keywords={globals} />
			</g>
		{/if}
	{:else}
		{#if cloudState.layers.hull && hullPoints.length > 0}
			<path
				d={lineGenerator(hullPoints)}
				class="pointer-events-none fill-blue-400/10 stroke-blue-500/30 stroke-[4px]"
				style="stroke-dasharray: 10,10"
			/>
		{/if}

		{#if cloudState.layers.wc}
			{#each locals as doc}
				<g transform="translate({xScale(doc.x)}, {yScale(doc.y)})">
					<NewWordCloud keywords={doc.keywords} />
				</g>
			{/each}
		{/if}

		{#if cloudState.layers.docs}
			{#each locals as doc}
				<circle
					role="presentation"
					cx={xScale(doc.x)}
					cy={yScale(doc.y)}
					r="8"
					class="cursor-pointer fill-blue-600 transition-colors hover:fill-orange-500"
					onmouseenter={(e) => onHover(e, doc)}
					onmousemove={(e) => onMove(e)}
					onmouseleave={onLeave}
				/>
			{/each}
		{/if}
	{/if}
</svg>
