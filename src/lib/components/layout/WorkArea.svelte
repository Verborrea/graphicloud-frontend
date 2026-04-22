<script lang="ts">
	import { limits } from '$lib/const';
	import { cloudState, configState, lassoState } from '$lib/state.svelte';
	import { pointInPolygon } from '$lib/utils';
	import Clouds from '../Clouds.svelte';

	let { offset = $bindable(), scale = $bindable() } = $props();

	let container = $state<HTMLDivElement>();
	let isPanning = $state(false);
	let startX = $state(0);
	let startY = $state(0);

	function toWorld(clientX: number, clientY: number) {
		if (!container) return { x: 0, y: 0 };
		const rect = container.getBoundingClientRect();

		const canvasX = clientX - rect.left;
		const canvasY = clientY - rect.top;

		return {
			x: (canvasX - offset.x) / scale,
			y: (canvasY - offset.y) / scale
		};
	}

	function onMouseDown(e: MouseEvent) {
		if (e.button !== 0) return;

		if (lassoState.active) {
			lassoState.isDrawing = true;
			lassoState.words = [];
			const pt = toWorld(e.clientX, e.clientY);
			lassoState.lassoPoints = [pt];
		} else {
			isPanning = true;
			startX = e.clientX - offset.x;
			startY = e.clientY - offset.y;
		}
	}

	function onMouseMove(e: MouseEvent) {
		if (lassoState.active && lassoState.isDrawing) {
			const pt = toWorld(e.clientX, e.clientY);
			lassoState.lassoPoints.push(pt);
		} else if (isPanning) {
			offset = { x: e.clientX - startX, y: e.clientY - startY };
		}
	}

	function onMouseUp() {
		if (lassoState.active && lassoState.isDrawing) {
			lassoState.isDrawing = false;
			lassoState.words = getWordsInsideLasso();
		} else {
			isPanning = false;
		}
	}

	function onWheel(e: WheelEvent) {
		e.preventDefault();
		if (!container) return;
		const rect = container.getBoundingClientRect();
		const cx = e.clientX - rect.left;
		const cy = e.clientY - rect.top;
		const factor = e.deltaY > 0 ? 0.9 : 1.1;
		const newScale = Math.min(Math.max(scale * factor, limits.zoom.min), limits.zoom.max);
		offset = {
			x: cx - (cx - offset.x) * (newScale / scale),
			y: cy - (cy - offset.y) * (newScale / scale)
		};
		scale = newScale;
	}

	function getWordsInsideLasso() {
		const polygon = lassoState.lassoPoints;
		if (polygon.length < 3) return [];

		const selected = [];

		const cloudsToProcess = configState.global ? [cloudState.global] : cloudState.locals;

		for (const cloud of cloudsToProcess) {
			if (!cloud || !cloud.nodes) continue;

			for (const node of cloud.nodes) {
				const worldX = cloud.ox + node.x;
				const worldY = cloud.oy + node.y;

				if (pointInPolygon({ x: worldX, y: worldY }, polygon)) {
					selected.push({
						word: node.text,
						score: node.score,
						cloudId: cloud.id || 'global'
					});
				}
			}
		}

		return selected;
	}
</script>

<svelte:window onmousemove={onMouseMove} onmouseup={onMouseUp} />

<div
	bind:this={container}
	class="relative h-full flex-1 cursor-grab overflow-hidden bg-white"
	class:cursor-grabbing={isPanning}
	class:!cursor-crosshair={lassoState.active}
	onmousedown={onMouseDown}
	onwheel={onWheel}
	role="presentation"
	aria-label="Canvas"
>
	<svg class="absolute inset-0 size-full">
		<g transform="translate({offset.x},{offset.y}) scale({scale})">
			<Clouds />
			{#if lassoState.lassoPoints.length > 1}
				<polygon
					points={lassoState.lassoPoints.map((p) => `${p.x},${p.y}`).join(' ')}
					class="fill-primary/10 stroke-primary stroke-[2px]"
					style="stroke-dasharray: 4;"
					vector-effect="non-scaling-stroke"
				/>
			{/if}
		</g>
	</svg>
</div>
