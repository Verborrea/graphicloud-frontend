<script lang="ts">
	import type { GCloud, GCNode } from '$lib/types';
	import { gclouds, layers, mode, preferences, lasso } from '$lib/state.svelte';
	import { getIconBitmap } from '$lib/iconRaster';

	let {
		ctx,
		offset,
		scale,
		width,
		height
	}: {
		ctx: CanvasRenderingContext2D;
		offset: { x: number; y: number };
		scale: number;
		width: number;
		height: number;
	} = $props();

	let bitmapTick = $state(0);
	const requestRepaint = () => bitmapTick++;

	// --color-primary: #2b7fff
	const PRIMARY = '#2b7fff';
	const PRIMARY_FADED = 'rgba(43, 127, 255, 0.1)';

	function drawNode(node: GCNode, offsetX: number, offsetY: number, color: string) {
		const cx = offsetX + node.x;
		const cy = offsetY + node.y;

		if (layers.bb) {
			ctx.save();
			ctx.strokeStyle = color;
			ctx.lineWidth = 0.5 / scale;
			ctx.strokeRect(cx - node.w / 2, cy - node.h / 2, node.w, node.h);
			ctx.restore();
		}

		if (!layers.wc) return;

		if (node.icon) {
			const bmp = getIconBitmap(node.icon, color, node.w, node.h, requestRepaint);
			if (bmp) {
				ctx.drawImage(bmp, cx - node.w / 2, cy - node.h / 2, node.w, node.h);
			}
			// bmp === null: todavía rasterizando, requestRepaint() forzará el
			// siguiente frame cuando esté listo.
		} else {
			ctx.save();
			ctx.fillStyle = color;
			ctx.font = `${node.fontSize}px ${preferences.font}`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'alphabetic';
			ctx.fillText(node.texts[0], cx, cy - node.h / 2 + node.ascent);
			ctx.restore();
		}
	}

	function drawCloud(cloud: GCloud) {
		for (const node of cloud.nodes) {
			drawNode(node, cloud.offsetX, cloud.offsetY, cloud.color);
		}
	}

	function render() {
		ctx.save();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // antes: width, height
		ctx.restore();

		ctx.save();
		ctx.translate(offset.x, offset.y);
		ctx.scale(scale, scale);

		if (mode.mode === 'global') {
			if (gclouds.global) drawCloud(gclouds.global);
		} else {
			for (const cloud of gclouds.locals) drawCloud(cloud);
		}

		if (lasso.lassoPoints.length > 1) {
			ctx.strokeStyle = PRIMARY;
			ctx.fillStyle = PRIMARY_FADED;
			ctx.lineWidth = 2 / scale;
			ctx.setLineDash([4 / scale, 4 / scale]);
			ctx.beginPath();
			const [first, ...rest] = lasso.lassoPoints;
			ctx.moveTo(first.x, first.y);
			for (const p of rest) ctx.lineTo(p.x, p.y);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}

		ctx.restore();
	}

	$effect(() => {
		gclouds.global;
		gclouds.locals;
		mode.mode;
		layers.wc;
		layers.bb;
		lasso.lassoPoints;
		offset;
		scale;
		width;
		height;
		bitmapTick;

		render();
	});
</script>
