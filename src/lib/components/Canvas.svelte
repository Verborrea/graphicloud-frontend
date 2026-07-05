<script lang="ts">
	import { limits, WORLD_SCALE } from '$lib/const';
	import { api, gclouds, lasso, layers, mode } from '$lib/state.svelte';
	import { pointInPolygon, cloudBounds } from '$lib/utils';
	import type { GCNode } from '$lib/types';
	import CloudsCanvas from './CloudsCanvas.svelte';
	import Tooltip from './ui/Tooltip.svelte';
	import Clouds from './Clouds.svelte';

	let { offset = $bindable(), scale = $bindable() } = $props();

	let width = $state(0);
	let height = $state(0);
	let container = $state<HTMLDivElement>();
	let canvasEl = $state<HTMLCanvasElement>();
	let ctx = $state<CanvasRenderingContext2D>();
	let isPanning = $state(false);
	let startX = $state(0);
	let startY = $state(0);

	// Evita que el fit-to-content se repita en cada cambio menor; solo corre
	// cuando hay contenido nuevo de verdad (nuevo build de nubes).
	let lastFitKey = $state('');

	$effect(() => {
		if (!canvasEl || width === 0 || height === 0) return;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvasEl.width = Math.round(width * dpr);
		canvasEl.height = Math.round(height * dpr);
		const c = canvasEl.getContext('2d');
		if (!c) return;
		c.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx = c;
	});

	// ── Fit-to-content ───────────────────────────────────────────────────────
	// Calcula el bounding box real (en coordenadas de mundo) de todo lo que
	// hay que mostrar, y ajusta offset/scale para que quepa centrado en el
	// viewport. Corre solo cuando el contenido cambia de verdad, no en cada
	// frame ni cada pan/zoom manual.
	function computeContentBounds() {
		if (mode.mode === 'global') {
			if (!gclouds.global || gclouds.global.nodes.length === 0) return null;
			const b = cloudBounds(gclouds.global.nodes);
			return {
				x: gclouds.global.offsetX + b.x,
				y: gclouds.global.offsetY + b.y,
				w: b.w,
				h: b.h
			};
		}

		const clouds = gclouds.locals.filter((c) => c.nodes.length > 0);
		if (clouds.length === 0) return null;

		let minX = Infinity,
			minY = Infinity,
			maxX = -Infinity,
			maxY = -Infinity;
		for (const cloud of clouds) {
			const b = cloudBounds(cloud.nodes);
			const x0 = cloud.offsetX + b.x;
			const y0 = cloud.offsetY + b.y;
			minX = Math.min(minX, x0);
			minY = Math.min(minY, y0);
			maxX = Math.max(maxX, x0 + b.w);
			maxY = Math.max(maxY, y0 + b.h);
		}
		return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
	}

	function fitToContent() {
		if (width === 0 || height === 0) return;
		const bounds = computeContentBounds();
		if (!bounds || bounds.w === 0 || bounds.h === 0) return;

		const PADDING = 0.85; // deja un margen alrededor del contenido
		const fitScale = Math.min((width / bounds.w) * PADDING, (height / bounds.h) * PADDING);
		const newScale = Math.min(Math.max(fitScale, limits.zoom.min), limits.zoom.max);

		const contentCenterX = bounds.x + bounds.w / 2;
		const contentCenterY = bounds.y + bounds.h / 2;

		scale = newScale;
		offset = {
			x: width / 2 - contentCenterX * newScale,
			y: height / 2 - contentCenterY * newScale
		};
	}

	$effect(() => {
		// Dependencias explícitas: solo recalcular cuando cambia el contenido
		// real de las nubes, no en cada pan/zoom (offset/scale no se leen aquí).
		gclouds.global;
		gclouds.locals;
		mode.mode;

		const bounds = computeContentBounds();
		if (!bounds) return;

		// Key simple para detectar "contenido nuevo" vs "mismo contenido,
		// solo recoloreado" (ej. al togglear clusterize no debe re-centrar).
		const key = `${mode.mode}|${bounds.x.toFixed(1)}|${bounds.y.toFixed(1)}|${bounds.w.toFixed(1)}|${bounds.h.toFixed(1)}`;
		if (key === lastFitKey) return;
		lastFitKey = key;

		fitToContent();
	});

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

	function toScreen(docX: number, docY: number) {
		return {
			x: docX * WORLD_SCALE * scale + offset.x,
			y: (WORLD_SCALE - docY * WORLD_SCALE) * scale + offset.y
		};
	}

	function onMouseDown(e: MouseEvent) {
		if (e.button !== 0) return;
		if (lasso.active) {
			lasso.isDrawing = true;
			lasso.words = [];
			const pt = toWorld(e.clientX, e.clientY);
			lasso.lassoPoints = [pt];
		} else {
			isPanning = true;
			startX = e.clientX - offset.x;
			startY = e.clientY - offset.y;
		}
	}

	function onMouseMove(e: MouseEvent) {
		if (lasso.active && lasso.isDrawing) {
			const pt = toWorld(e.clientX, e.clientY);
			lasso.lassoPoints.push(pt);
		} else if (isPanning) {
			offset = { x: e.clientX - startX, y: e.clientY - startY };
		} else {
			updateHover(e.clientX, e.clientY);
		}
	}

	function onMouseUp() {
		if (lasso.active && lasso.isDrawing) {
			lasso.isDrawing = false;
			lasso.words = getWordsInsideLasso();
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
		const polygon = lasso.lassoPoints;
		if (polygon.length < 3) return [];
		const selected = [];
		const cloudsToProcess = mode.mode === 'global' ? [gclouds.global] : gclouds.locals;
		for (const cloud of cloudsToProcess) {
			if (!cloud || !cloud.nodes) continue;
			for (const node of cloud.nodes) {
				const worldX = cloud.offsetX + node.x;
				const worldY = cloud.offsetY + node.y;
				if (pointInPolygon({ x: worldX, y: worldY }, polygon)) {
					selected.push({ word: node.texts[0], score: node.score, cloudId: cloud.id || 'global' });
				}
			}
		}
		return selected;
	}

	function updateHover(clientX: number, clientY: number) {
		if (!layers.wc) {
			if (lasso.hoveredNode) lasso.hoveredNode = null;
			return;
		}
		const world = toWorld(clientX, clientY);
		const cloudsToProcess = mode.mode === 'global' ? [gclouds.global] : gclouds.locals;
		let found: { node: GCNode; offsetX: number; offsetY: number } | null = null;

		for (const cloud of cloudsToProcess) {
			if (!cloud || !cloud.nodes) continue;
			for (let i = cloud.nodes.length - 1; i >= 0; i--) {
				const node = cloud.nodes[i];
				const localX = world.x - cloud.offsetX;
				const localY = world.y - cloud.offsetY;
				if (
					localX >= node.x - node.w / 2 &&
					localX <= node.x + node.w / 2 &&
					localY >= node.y - node.h / 2 &&
					localY <= node.y + node.h / 2
				) {
					found = { node, offsetX: cloud.offsetX, offsetY: cloud.offsetY };
					break;
				}
			}
			if (found) break;
		}

		if (found) {
			lasso.hoveredNode = {
				texts: found.node.texts,
				score: found.node.score,
				x: found.offsetX + found.node.x,
				y: found.offsetY + found.node.y
			};
		} else if (lasso.hoveredNode) {
			lasso.hoveredNode = null;
		}
	}
</script>

<svelte:window onmousemove={onMouseMove} onmouseup={onMouseUp} />

<div
	bind:this={container}
	bind:clientWidth={width}
	bind:clientHeight={height}
	class="relative h-full flex-1 cursor-grab overflow-hidden bg-white"
	class:cursor-grabbing={isPanning}
	class:!cursor-crosshair={lasso.active}
	onmousedown={onMouseDown}
	onwheel={onWheel}
	role="presentation"
	aria-label="Canvas"
>
	<canvas
		bind:this={canvasEl}
		class="absolute inset-0"
		style="width: {width}px; height: {height}px;"
	></canvas>

	{#if api.isLoading}
		<div class="absolute inset-0 flex items-center justify-center">
			<svg width="56" height="56" viewBox="0 0 56 56">
				<circle
					cx="28"
					cy="28"
					r="22"
					class="fill-transparent stroke-slate-300"
					stroke-width="5"
					stroke-linecap="round"
					stroke-dasharray="110 47"
				>
					<animateTransform
						attributeName="transform"
						type="rotate"
						from="0 28 28"
						to="360 28 28"
						dur="1s"
						repeatCount="indefinite"
					/>
				</circle>
			</svg>
		</div>
	{:else if ctx}
		<Clouds />
		<CloudsCanvas {ctx} {offset} {scale} {width} {height} />
	{/if}

	{#if mode.mode === 'local' && layers.docs}
		{#each api.results?.locals ?? [] as doc}
			{@const pos = toScreen(doc.x, doc.y)}
			<Tooltip {doc} x={pos.x} y={pos.y} {scale} />
		{/each}
	{/if}

	{#if lasso.hoveredNode}
		{@const screenX = lasso.hoveredNode.x * scale + offset.x}
		{@const screenY = lasso.hoveredNode.y * scale + offset.y}
		<div
			class="pointer-events-none absolute z-50 rounded-xl border border-slate-200 bg-white/95 p-2 py-1 shadow-md backdrop-blur-sm"
			style="left: {screenX + 12}px; top: {screenY - 12}px; min-width: 180px;"
		>
			<div class="mt-1 flex flex-wrap gap-1">
				{#each lasso.hoveredNode.texts as word}
					<span class="rounded bg-slate-100 px-1.5 py-0.5 text-[12px] font-medium text-slate-800"
						>{word}</span
					>
				{/each}
			</div>
			<hr class="my-1.5 border-slate-200" />
			<div class="text-[10px] text-slate-500">
				Score: <span class="font-mono font-semibold text-slate-700"
					>{lasso.hoveredNode.score.toFixed(4)}</span
				>
			</div>
		</div>
	{/if}
</div>
