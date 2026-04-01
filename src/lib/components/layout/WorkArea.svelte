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
	let cloudsSvg = $state<SVGSVGElement | null>(null); // ref al SVG de Clouds
	let tooltip = $state({ x: 0, y: 0, visible: false, text: '', coords: [0, 0] });

	let centerX = $derived(container ? container.clientWidth / 2 : 0);
	let centerY = $derived(container ? container.clientHeight / 2 : 0);
	let bgPosX = $derived(centerX + offset.x);
	let bgPosY = $derived(centerY + offset.y);
	let gridSize = $derived(20 * scale);

	const xScale = $derived(d3.scaleLinear().domain([0, 1]).range([0, cloudState.range]));
	const yScale = $derived(d3.scaleLinear().domain([0, 1]).range([cloudState.range, 0]));

	// Convierte coordenadas de pantalla (relativas al container) → mundo del canvas
	function screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
		return {
			x: (screenX - centerX - offset.x) / scale,
			y: (screenY - centerY - offset.y) / scale
		};
	}

	function worldToSvg(worldX: number, worldY: number): { x: number; y: number } {
		if (!cloudsSvg) {
			// Fallback: asumir que 1 mundo = 1 SVG (sin escala)
			return { x: worldX, y: worldY };
		}
		const rect = cloudsSvg.getBoundingClientRect();
		const svgPx = rect.width; // tamaño real en píxeles del SVG
		const ratio = cloudState.range / svgPx; // unidades SVG por píxel

		// El SVG está centrado en el div (items-center justify-center antes, ahora top-1/2 left-1/2)
		// Su esquina top-left en coordenadas mundo es (-svgPx/2, -svgPx/2)
		const svgOriginX = -svgPx / 2;
		const svgOriginY = -svgPx / 2;

		return {
			x: (worldX - svgOriginX) * ratio,
			y: (worldY - svgOriginY) * ratio
		};
	}

	function commitLasso(points: { x: number; y: number }[]) {
		if (points.length < 3) return;

		const locals = cloudState.results?.locals ?? [];
		const globals = cloudState.results?.global ?? [];
		const matched: typeof selectState.words = [];

		// Convertir todos los puntos del lazo a coordenadas SVG internas una sola vez
		const lassoInSvg = points.map((p) => worldToSvg(p.x, p.y));

		function testWords(
			words: { x: number; y: number; text: string; score: number }[],
			cloudOriginSvgX: number, // origen de la nube en coordenadas SVG
			cloudOriginSvgY: number,
			cloudId: string
		) {
			for (const w of words) {
				// word.x/y son relativas al origen de la nube (el translate del <g>)
				const svgPt = { x: cloudOriginSvgX + w.x, y: cloudOriginSvgY + w.y };
				if (pointInPolygon(svgPt, lassoInSvg)) {
					matched.push({ text: w.text, score: w.score, cloudId });
				}
			}
		}

		if (cloudState.global) {
			// La nube global está en translate(range/2, range/2) dentro del SVG
			testWords(
				(globals as any[]).map((w) => ({ x: w.x ?? 0, y: w.y ?? 0, text: w.word, score: w.score })),
				cloudState.range / 2,
				cloudState.range / 2,
				'global'
			);
		} else {
			for (const doc of locals) {
				// Cada doc está en translate(xScale(doc.x), yScale(doc.y)) dentro del SVG
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
		selectState.active = false;
		selectState.isDrawing = false;

		console.log(selectState.words);
	}

	// ── Mouse handlers ──────────────────────────────────────────────────────

	const handleMouseDown = (e: MouseEvent) => {
		if (selectState.active) {
			if (e.button !== 0) return;
			selectState.words = [];
			selectState.lassoPoints = [];
			selectState.isDrawing = true;
			const rect = container!.getBoundingClientRect();
			selectState.lassoPoints = [screenToWorld(e.clientX - rect.left, e.clientY - rect.top)];
			return;
		}
		if (e.button === 0) isDragging = true;
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (selectState.isDrawing) {
			const rect = container!.getBoundingClientRect();
			const world = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
			const last = selectState.lassoPoints.at(-1)!;
			const threshold = 4 / scale;
			const dx = world.x - last.x;
			const dy = world.y - last.y;
			if (dx * dx + dy * dy > threshold * threshold) {
				selectState.lassoPoints = [...selectState.lassoPoints, world];
			}
			return;
		}
		if (isDragging) {
			offset.x += e.movementX;
			offset.y += e.movementY;
		}
	};

	const handleMouseUp = () => {
		if (selectState.isDrawing) {
			commitLasso(selectState.lassoPoints);
			return;
		}
		if (isDragging) isDragging = false;
	};

	const handleMouseLeave = () => {
		if (selectState.isDrawing) {
			commitLasso(selectState.lassoPoints);
			return;
		}
		isDragging = false;
	};

	const handleWheel = (e: WheelEvent) => {
		e.preventDefault();
		if (!container) return;

		const rect = container.getBoundingClientRect();
		const mouseX = e.clientX - rect.left - rect.width / 2;
		const mouseY = e.clientY - rect.top - rect.height / 2;

		const oldScale = scale;
		const newScale = Math.min(
			Math.max(limits.zoom.min, scale - e.deltaY * zoomSpeed * (scale / 2)),
			limits.zoom.max
		);

		if (oldScale === newScale) return;

		const ratio = newScale / oldScale;
		offset.x = mouseX - (mouseX - offset.x) * ratio;
		offset.y = mouseY - (mouseY - offset.y) * ratio;

		scale = newScale;
	};

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

	// Path del lazo en coordenadas mundo — vive dentro del div transformado
	let lassoPath = $derived(
		selectState.lassoPoints.length > 1
			? selectState.lassoPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') +
					' Z'
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

	<!-- Div transformado: origen en el centro del container -->
	<div
		class="pointer-events-none absolute top-1/2 left-1/2"
		style:transform="translate({offset.x}px, {offset.y}px) scale({scale})"
		style:transform-origin="0 0"
	>
		{#if cloudState.results}
			<!-- bind:svgEl expone el elemento SVG raíz para worldToSvg -->
			<Clouds {onHover} {onMove} {onLeave} bind:svgEl={cloudsSvg} />
		{/if}

		<!-- Lazo SVG: anclado en 0,0 del mundo, overflow:visible para dibujar fuera -->
		{#if lassoPath}
			<svg
				class="pointer-events-none absolute top-0 left-0"
				width="1"
				height="1"
				overflow="visible"
			>
				<path
					d={lassoPath}
					fill="rgba(99,102,241,0.08)"
					stroke="#6366f1"
					stroke-width={1.5 / scale}
					stroke-dasharray={selectState.isDrawing ? `${6 / scale},${3 / scale}` : 'none'}
					stroke-linejoin="round"
				/>
			</svg>
		{/if}
	</div>

	<!-- Loader fuera del transform -->
	{#if cloudState.isLoading}
		<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
			<div class="flex animate-pulse flex-col items-center gap-2 text-primary">
				<Loader class="animate-spin" size={48} />
				<span class="font-bold">Loading...</span>
			</div>
		</div>
	{/if}

	{#if tooltip.visible}
		<Tooltip {tooltip} />
	{/if}
</main>
