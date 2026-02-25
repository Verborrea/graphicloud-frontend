<script lang="ts">
	import NewWordCloud from './NewWordCloud.svelte';

	const zoomSpeed = 0.001;
	const minZoom = 0.1;
	const maxZoom = 5;

	let { offset = $bindable(), scale = $bindable() } = $props();

	let isDragging = $state(false);

	let keywords = $state([
		{ word: 'Svelte', score: 100 },
		{ word: 'D3.js', score: 80 },
		{ word: 'Tailwind', score: 60 },
		{ word: 'TypeScript', score: 90 },
		{ word: 'Canvas', score: 40 },
		{ word: 'Zoom', score: 70 }
	]);

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
		scale = Math.min(Math.max(minZoom, scale - e.deltaY * zoomSpeed), maxZoom);
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
	>
		<svg class="pointer-events-auto overflow-visible">
			<NewWordCloud {keywords} min={20} max={80} showBoxes={false} />
		</svg>
	</div>
</main>
