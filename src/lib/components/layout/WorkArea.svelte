<script lang="ts">
	import { limits, zoomSpeed } from '$lib/const';

	import Tooltip from '$lib/components/ui/Tooltip.svelte';
	import Clouds from './Clouds.svelte';
	import { selectState, cloudState } from '$lib/state.svelte';
	import { Loader } from '@lucide/svelte';
	import { pointInPolygon } from '$lib/utils';
	import * as d3 from 'd3';

	let { offset = $bindable(), scale = $bindable() } = $props();

	let isDragging = $state(false);
	let container = $state<HTMLElement | null>(null);
	let tooltip = $state({ x: 0, y: 0, visible: false, text: '', coords: [0, 0] });

	let centerX = $derived(container ? container.clientWidth / 2 : 0);
	let centerY = $derived(container ? container.clientHeight / 2 : 0);
	let bgPosX = $derived(centerX + offset.x);
	let bgPosY = $derived(centerY + offset.y);
	let gridSize = $derived(20 * scale);

	// Lazo en coordenadas de pantalla (relativas al container)
	let lassoPoints = $state<{ x: number; y: number }[]>([]);
	let isDrawingLasso = $state(false);

	const xScale = $derived(d3.scaleLinear().domain([0, 1]).range([0, cloudState.range]));
	const yScale = $derived(d3.scaleLinear().domain([0, 1]).range([cloudState.range, 0]));

	function worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
		if (!container) return { x: 0, y: 0 };
		return {
			x: centerX + offset.x + worldX * scale,
			y: centerY + offset.y + worldY * scale
		};
	}

	function commitLasso(points: { x: number; y: number }[]) {
		if (points.length < 3) return;

		const locals = cloudState.results?.locals ?? [];
		const globals = cloudState.results?.global ?? [];
		const matched: typeof selectState.words = [];

		function testWords(
			words: { x: number; y: number; text: string; score: number }[],
			cloudOriginX: number,
			cloudOriginY: number,
			cloudId: string
		) {
			for (const w of words) {
				const screen = worldToScreen(cloudOriginX + w.x, cloudOriginY + w.y);
				if (pointInPolygon(screen, points)) {
					matched.push({ text: w.text, score: w.score, cloudId });
				}
			}
		}

		if (cloudState.global) {
			testWords(
				(globals as any[]).map((w) => ({ x: w.x ?? 0, y: w.y ?? 0, text: w.word, score: w.score })),
				cloudState.range / 2,
				cloudState.range / 2,
				'global'
			);
		} else {
			for (const doc of locals) {
				testWords(
					(doc.keywords as any[]).map((w) => ({
						x: w.x ?? 0,
						y: w.y ?? 0,
						text: w.word,
						score: w.score
					})),
					xScale(doc.x),
					yScale(doc.y),
					doc.id ?? doc.filename
				);
			}
		}

		selectState.words = matched;
	}

	// ── Mouse handlers ──────────────────────────────────────────────────────

	const handleMouseDown = (e: MouseEvent) => {
		if (selectState.active) {
			if (e.button !== 0) return;
			// Limpiar selección anterior al empezar un nuevo lazo
			selectState.words = [];
			isDrawingLasso = true;
			const rect = container!.getBoundingClientRect();
			lassoPoints = [{ x: e.clientX - rect.left, y: e.clientY - rect.top }];
			return;
		}
		if (e.button === 0) isDragging = true;
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (isDrawingLasso) {
			const rect = container!.getBoundingClientRect();
			// Submuestreo: solo agrega punto si se movió > 4px
			const last = lassoPoints.at(-1)!;
			const dx = e.clientX - rect.left - last.x;
			const dy = e.clientY - rect.top - last.y;
			if (dx * dx + dy * dy > 16) {
				lassoPoints = [...lassoPoints, { x: e.clientX - rect.left, y: e.clientY - rect.top }];
			}
			return;
		}
		if (isDragging) {
			offset.x += e.movementX;
			offset.y += e.movementY;
		}
	};

	const handleMouseUp = (e: MouseEvent) => {
		if (isDrawingLasso) {
			isDrawingLasso = false;
			commitLasso(lassoPoints);
			// NO limpiamos lassoPoints aquí — lo dejamos para mostrar el contorno
			// Se limpia al empezar un nuevo lazo (mousedown) o al desactivar el modo
			return;
		}
		if (isDragging) isDragging = false;
	};

	const handleMouseLeave = () => {
		if (isDrawingLasso) {
			// Si el mouse sale del container, cerramos el lazo con lo que hay
			isDrawingLasso = false;
			commitLasso(lassoPoints);
			return;
		}
		isDragging = false;
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

	// Limpiar lazo al desactivar el modo
	$effect(() => {
		if (!selectState.active) {
			lassoPoints = [];
			isDrawingLasso = false;
		}
	});

	// ── Tooltip ─────────────────────────────────────────────────────────────
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

	// Path del lazo cerrado
	let lassoPath = $derived(
		lassoPoints.length > 1
			? lassoPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z'
			: ''
	);
</script>

<main
	bind:this={container}
	role="presentation"
	class="relative flex-1 overflow-hidden bg-white select-none"
	class:cursor-crosshair={selectState.active}
	class:cursor-grab={!selectState.active && !isDragging}
	class:cursor-grabbing={!selectState.active && isDragging}
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	onmouseleave={handleMouseLeave}
	onwheel={handleWheel}
>
	<!-- Grid background -->
	<div
		class="pointer-events-none absolute inset-0"
		style:background-image="radial-gradient(var(--color-gray-300) 1px, transparent 1px)"
		style:background-size="{gridSize}px {gridSize}px"
		style:background-position="{bgPosX}px {bgPosY}px"
	></div>

	<!-- Contenido transformado -->
	<div
		class="pointer-events-none absolute inset-0 flex items-center justify-center"
		style:transform="translate({offset.x}px, {offset.y}px) scale({scale})"
	>
		{#if cloudState.isLoading}
			<div class="flex animate-pulse flex-col items-center gap-2 text-primary">
				<Loader class="animate-spin" size={48} />
				<span class="font-bold">Loading...</span>
			</div>
		{:else if cloudState.results}
			<Clouds {onHover} {onMove} {onLeave} />
		{/if}
	</div>

	<!-- Lazo SVG overlay — siempre montado, solo visible cuando hay puntos -->
	{#if lassoPath}
		<svg class="pointer-events-none absolute inset-0 h-full w-full" style="z-index: 40;">
			<path
				d={lassoPath}
				fill="rgba(99,102,241,0.08)"
				stroke="#6366f1"
				stroke-width="1.5"
				stroke-dasharray={isDrawingLasso ? '6,3' : 'none'}
				stroke-linejoin="round"
			/>
		</svg>
	{/if}

	{#if tooltip.visible}
		<Tooltip {tooltip} />
	{/if}
</main>
