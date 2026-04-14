<script lang="ts">
	import Clouds from '../Clouds.svelte';

	let { offset = $bindable(), scale = $bindable() } = $props();

	let container = $state<HTMLDivElement>();
	let isPanning = $state(false);
	let startX = $state(0);
	let startY = $state(0);

	function onMouseDown(e: MouseEvent) {
		if (e.button !== 0) return;
		isPanning = true;
		startX = e.clientX - offset.x;
		startY = e.clientY - offset.y;
	}

	function onMouseMove(e: MouseEvent) {
		if (!isPanning) return;
		offset = { x: e.clientX - startX, y: e.clientY - startY };
	}

	function onMouseUp() {
		isPanning = false;
	}

	function onWheel(e: WheelEvent) {
		e.preventDefault();
		if (!container) return;
		const rect = container.getBoundingClientRect();
		const cx = e.clientX - rect.left;
		const cy = e.clientY - rect.top;
		const factor = e.deltaY > 0 ? 0.9 : 1.1;
		const newScale = Math.min(Math.max(scale * factor, 0.05), 20);
		offset = {
			x: cx - (cx - offset.x) * (newScale / scale),
			y: cy - (cy - offset.y) * (newScale / scale)
		};
		scale = newScale;
	}
</script>

<svelte:window onmousemove={onMouseMove} onmouseup={onMouseUp} />

<div
	bind:this={container}
	class="relative h-full flex-1 cursor-grab overflow-hidden bg-white"
	class:cursor-grabbing={isPanning}
	onmousedown={onMouseDown}
	onwheel={onWheel}
	role="presentation"
	aria-label="Canvas"
>
	<svg class="absolute inset-0 size-full">
		<g transform="translate({offset.x},{offset.y}) scale({scale})">
			<Clouds />
		</g>
	</svg>
</div>
