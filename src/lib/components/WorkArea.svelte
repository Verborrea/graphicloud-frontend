<script lang="ts">
	import { limits, zoomSpeed } from '$lib/const';
	import { mockData } from '$lib/newMockData';
	import { cloudState } from '$lib/state.svelte';
	import { convexHull } from '$lib/utils';
	import * as d3 from 'd3';

	import NewWordCloud from './NewWordCloud.svelte';
	import Tooltip from '$lib/components/ui/Tooltip.svelte';

	let isDragging = $state(false);
	let { offset = $bindable(), scale = $bindable() } = $props();
	let tooltip = $state({ x: 0, y: 0, visible: false, text: '', coords: [0, 0] });

	const range = 1000;
	const padding = 0;

	const xScale = $derived(
		d3
			.scaleLinear()
			.domain([0, 1])
			.range([padding, range - padding])
	);
	const yScale = $derived(
		d3
			.scaleLinear()
			.domain([0, 1])
			.range([range - padding, padding])
	);

	const hullPoints = $derived(mockData.locals.length >= 3 ? convexHull(mockData.locals) : []);
	const lineGenerator = $derived(
		d3
			.line<any>()
			.x((d) => xScale(d.x))
			.y((d) => yScale(d.y))
			.curve(d3.curveLinearClosed)
	);

	const handleMouseDown = (e: any) => {
		if (e.button === 0) isDragging = true;
	};

	const handleMouseMove = (e: any) => {
		if (isDragging) {
			offset.x += e.movementX;
			offset.y += e.movementY;
		}
	};

	const stopDragging = () => (isDragging = false);

	const handleWheel = (e: any) => {
		e.preventDefault();
		scale = Math.min(Math.max(limits.zoom.min, scale - e.deltaY * zoomSpeed), limits.zoom.max);
	};
</script>

<main
	role="presentation"
	class="relative flex-1 cursor-grab overflow-hidden bg-gray-100 select-none active:cursor-grabbing"
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
	onmouseup={stopDragging}
	onmouseleave={stopDragging}
	onwheel={handleWheel}
>
	<div
		class="pointer-events-none absolute inset-0"
		style:background-image="radial-gradient(var(--color-gray-400) 1px, transparent 1px)"
		style:background-size="16px 16px"
		style:background-position="{offset.x}px {offset.y}px"
	></div>
	<div
		class="pointer-events-none absolute inset-0 flex items-center justify-center"
		style:transform="translate({offset.x}px, {offset.y}px) scale({scale})"
	>
		<svg
			viewBox="0 0 {range} {range}"
			class="pointer-events-auto h-200 w-200 overflow-visible bg-red-100"
		>
			{#if cloudState.global}
				<g transform="translate({range / 2}, {range / 2})">
					<NewWordCloud keywords={mockData.global} />
				</g>
			{:else}
				{#if cloudState.layers.hull && hullPoints.length > 0}
					<path
						d={lineGenerator(hullPoints)}
						class="pointer-events-none fill-blue-400/10 stroke-blue-500/30 stroke-[4px]"
						style="stroke-dasharray: 10,10"
					/>
				{/if}

				{#if cloudState.layers.wc}
					{#each mockData.locals as doc}
						<g transform="translate({xScale(doc.x)}, {yScale(doc.y)})">
							<NewWordCloud keywords={doc.keywords} />
						</g>
					{/each}
				{/if}

				{#if cloudState.layers.docs}
					{#each mockData.locals as doc}
						<circle
							role="presentation"
							cx={xScale(doc.x)}
							cy={yScale(doc.y)}
							r="8"
							class="cursor-pointer fill-blue-600 transition-colors hover:fill-orange-500"
							onmouseenter={(e) =>
								(tooltip = {
									x: e.clientX,
									y: e.clientY,
									visible: true,
									text: doc.filename,
									coords: [doc.x, doc.y]
								})}
							onmousemove={(e) => {
								tooltip.x = e.clientX;
								tooltip.y = e.clientY;
							}}
							onmouseleave={() => (tooltip.visible = false)}
						/>
					{/each}
				{/if}
			{/if}
		</svg>
	</div>
	{#if tooltip.visible}
		<Tooltip {tooltip} />
	{/if}
</main>
