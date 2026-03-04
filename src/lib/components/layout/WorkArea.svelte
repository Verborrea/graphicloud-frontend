<script lang="ts">
	import { limits, zoomSpeed } from '$lib/const';

	import Tooltip from '$lib/components/ui/Tooltip.svelte';
	import Clouds from './Clouds.svelte';
	import { cloudState } from '$lib/state.svelte';
	import { Loader } from '@lucide/svelte';

	let { offset = $bindable(), scale = $bindable() } = $props();

	let isDragging = $state(false);
	let container = $state<HTMLElement | null>(null);
	let tooltip = $state({ x: 0, y: 0, visible: false, text: '', coords: [0, 0] });

	let centerX = $derived(container ? container.clientWidth / 2 : 0);
	let centerY = $derived(container ? container.clientHeight / 2 : 0);
	let bgPosX = $derived(centerX + offset.x);
	let bgPosY = $derived(centerY + offset.y);
	let gridSize = $derived(20 * scale);

	const handleMouseDown = (e: MouseEvent) => {
		if (e.button === 0) isDragging = true;
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (isDragging) {
			offset.x += e.movementX;
			offset.y += e.movementY;
		}
	};

	const handleWheel = (e: WheelEvent) => {
		e.preventDefault();
		if (!container) return;

		const rect = container.getBoundingClientRect();

		// 1. Posición del mouse relativa al centro del contenedor (donde ocurre el transform)
		const mouseX = e.clientX - rect.left - rect.width / 2;
		const mouseY = e.clientY - rect.top - rect.height / 2;

		// 2. Guardamos la escala anterior y calculamos la nueva
		const oldScale = scale;
		const newScale = Math.min(
			Math.max(limits.zoom.min, scale - e.deltaY * zoomSpeed * (scale / 2)), // Ajuste de sensibilidad
			limits.zoom.max
		);

		if (oldScale === newScale) return;

		// 3. La "magia": Ajustamos el offset para compensar el desplazamiento del punto bajo el mouse
		// Fórmula: nuevoOffset = mouse - (mouse - viejoOffset) * (nuevaEscala / viejaEscala)
		const ratio = newScale / oldScale;

		offset.x = mouseX - (mouseX - offset.x) * ratio;
		offset.y = mouseY - (mouseY - offset.y) * ratio;

		scale = newScale;
	};

	const stopDragging = () => (isDragging = false);

	// Tooltip code:

	const onHover = (e: any, doc: any) =>
		(tooltip = {
			x: e.clientX,
			y: e.clientY,
			visible: true,
			text: doc.filename,
			coords: [doc.x, doc.y]
		});
	const onMove = (e: any) => {
		tooltip.x = e.clientX;
		tooltip.y = e.clientY;
	};
	const onLeave = () => (tooltip.visible = false);
</script>

<main
	bind:this={container}
	role="presentation"
	class="relative flex-1 cursor-grab overflow-hidden bg-white select-none active:cursor-grabbing"
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
	onmouseup={stopDragging}
	onmouseleave={stopDragging}
	onwheel={handleWheel}
>
	<div
		class="pointer-events-none absolute inset-0"
		style:background-image="radial-gradient(var(--color-gray-300) 1px, transparent 1px)"
		style:background-size="{gridSize}px {gridSize}px"
		style:background-position="{bgPosX}px {bgPosY}px"
	></div>

	<div
		class="pointer-events-none absolute inset-0 flex items-center justify-center"
		style:transform="translate({offset.x}px, {offset.y}px) scale({scale})"
	>
		{#if cloudState.isLoading}
			<div class="flex animate-pulse flex-col items-center gap-2 text-primary">
				<Loader class="animate-spin" size={48} />
				<span class="font-bold">Procesando documentos...</span>
			</div>
		{:else if cloudState.results}
			<Clouds {onHover} {onMove} {onLeave} />
		{/if}
	</div>

	{#if tooltip.visible}
		<Tooltip {tooltip} />
	{/if}
</main>
