<script lang="ts">
	import type { Result } from '$lib/types';

	let {
		doc,
		x,
		y,
		scale = 1
	} = $props<{
		doc: Result;
		x: number;
		y: number;
		scale?: number;
	}>();

	let canvas: HTMLCanvasElement | null = null;
	let hovered = $state(false);

	function measureText(text: string, font: string): number {
		if (!canvas) canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d')!;
		ctx.font = font;
		return ctx.measureText(text).width;
	}

	const tooltipWidth = $derived(
		Math.max(170, measureText(doc.filename, '600 13px Inter, sans-serif') + 24)
	);

	const dotSize = $derived(Math.min(Math.max(6 * scale, 6), 20));
</script>

<div
	class="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-blue-600 transition-transform"
	class:scale-125={hovered}
	style="left: {x}px; top: {y}px; width: {dotSize}px; height: {dotSize}px;"
	onmouseenter={() => (hovered = true)}
	onmouseleave={() => (hovered = false)}
	role="presentation"
></div>

<!-- tooltip -->
{#if hovered}
	<div
		class="pointer-events-none absolute z-50 rounded-xl border border-slate-200 bg-white/95 shadow-md"
		style="left: {x + 16}px; top: {y - 16}px; width: {tooltipWidth}px;"
	>
		<div class="px-3 py-2">
			<p class="truncate text-[13px] font-semibold text-slate-900">{doc.filename}</p>
			<hr class="my-1 border-slate-200" />
			<div class="flex gap-4 text-[11px] text-slate-600">
				<span>x: {doc.x.toFixed(3)}</span>
				<span>y: {doc.y.toFixed(3)}</span>
			</div>
		</div>
	</div>
{/if}
