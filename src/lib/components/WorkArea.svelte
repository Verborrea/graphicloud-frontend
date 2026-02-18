<script lang="ts">
	import { MousePointer2 } from '@lucide/svelte';

	let { offset = $bindable(), scale = $bindable() } = $props();

	let isDraggingCanvas = $state(false);

	const handleMouseDown = (e: any) => {
		if (e.button === 0) isDraggingCanvas = true;
	};

	const handleMouseMove = (e: any) => {
		if (isDraggingCanvas) {
			offset.x += e.movementX;
			offset.y += e.movementY;
		}
	};

	const stopDragging = () => (isDraggingCanvas = false);

	// --- LÓGICA DE ZOOM ---
	const handleWheel = (e: any) => {
		e.preventDefault();
		const zoomSpeed = 0.001;
		const delta = -e.deltaY;
		const newScale = scale + delta * zoomSpeed;
		// Limitar zoom entre 0.1x y 5x
		scale = Math.min(Math.max(0.1, newScale), 5);
	};
</script>

<main
	role="presentation"
	class="relative flex-1 cursor-grab overflow-hidden bg-[#F1F5F9] select-none active:cursor-grabbing"
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
	onmouseup={stopDragging}
	onmouseleave={stopDragging}
	onwheel={handleWheel}
>
	<div
		class="pointer-events-none absolute inset-0 opacity-[0.4]"
		style:background-image="radial-gradient(#cbd5e1 1px, transparent 1px)"
		style:background-size="16px 16px"
		style:background-position="{offset.x}px {offset.y}px"
	></div>

	<div
		class="pointer-events-none absolute inset-0 flex items-center justify-center"
		style:transform="translate({offset.x}px, {offset.y}px) scale({scale})"
		style:transform-origin="center"
	>
		<div class="group pointer-events-auto relative">
			<div
				class="flex h-48 w-48 items-center justify-center rounded-full border-[3px] border-blue-500 bg-white shadow-2xl transition-transform group-hover:scale-105"
			>
				<div
					class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg"
				>
					<MousePointer2 size={20} fill="currentColor" />
				</div>
			</div>
			<div
				class="absolute -bottom-10 left-1/2 -translate-x-1/2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold whitespace-nowrap shadow-sm"
			>
				CENTRAL_NODE_01
			</div>
		</div>
	</div>
</main>
