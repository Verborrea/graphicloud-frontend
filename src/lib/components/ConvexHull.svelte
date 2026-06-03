<script lang="ts">
	import * as d3 from 'd3';
	import { layers } from '$lib/state.svelte';
	import { convexHull } from '$lib/utils';

	let { xScale, yScale, locals } = $props();

	const hullPoints = $derived(locals.length >= 3 ? convexHull(locals) : []);

	const lineGenerator = $derived(
		d3
			.line<any>()
			.x((d) => xScale(d.x))
			.y((d) => yScale(d.y))
			.curve(d3.curveLinearClosed)
	);
</script>

{#if layers.hull && hullPoints.length > 0}
	<path
		d={lineGenerator(hullPoints)}
		class="pointer-events-none fill-blue-400/10 stroke-blue-500/30 stroke-[4px]"
		style="stroke-dasharray: 10,10"
	/>
{/if}
