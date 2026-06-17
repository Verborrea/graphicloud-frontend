<script lang="ts">
	import { gclouds, layers, preferences, lasso } from '$lib/state.svelte';

	let { cloudId, isGlobal = false, offsetX = 0, offsetY = 0 } = $props();

	const cloudData = $derived(
		isGlobal ? gclouds.global : gclouds.locals.find((l) => l.id === cloudId)
	);

	const nodes = $derived(cloudData?.nodes ?? []);
	const cloudColor = $derived(cloudData?.color ?? '#000000');

	function colorizeSvg(svg: string, color: string): string {
		let out = svg.replaceAll('currentColor', color);

		// ¿Hay algún fill/stroke "real" (no "none") ya declarado?
		const hasRealFill = /fill\s*=\s*["'](?!none)/i.test(out);
		const hasRealStroke = /stroke\s*=\s*["'](?!none)/i.test(out);

		// Sobreescribir fills/strokes explícitos (packs monocromos), preservando
		// "none" para no romper íconos de contorno (stroke + fill="none").
		out = out
			.replace(/fill\s*=\s*"(?!none")[^"]*"/gi, `fill="${color}"`)
			.replace(/fill\s*=\s*'(?!none')[^']*'/gi, `fill='${color}'`)
			.replace(/stroke\s*=\s*"(?!none")[^"]*"/gi, `stroke="${color}"`)
			.replace(/stroke\s*=\s*'(?!none')[^']*'/gi, `stroke='${color}'`);

		// Sin fill ni stroke en ningún lado: forzar fill en el <svg> raíz para que
		// cascadee a los <path> que heredan (caso Material sin fill).
		if (!hasRealFill && !hasRealStroke) {
			out = out.replace(/<svg\b/i, `<svg fill="${color}"`);
		}

		return out;
	}
</script>

<g class="word-cloud">
	{#each nodes as node}
		{#if layers.bb}
			<rect
				x={offsetX + node.x - node.w / 2}
				y={offsetY + node.y - node.h / 2}
				width={node.w}
				height={node.h}
				fill="none"
				stroke={cloudColor}
				stroke-width="0.5"
			/>
		{/if}

		{#if layers.wc}
			{#if node.icon}
				<g
					class="cursor-pointer"
					onmouseenter={() => {
						lasso.hoveredNode = {
							texts: node.texts,
							score: node.score,
							x: offsetX + node.x,
							y: offsetY + node.y
						};
					}}
					onmouseleave={() => {
						lasso.hoveredNode = null;
					}}
					role="presentation"
				>
					<image
						href="data:image/svg+xml,{encodeURIComponent(
							colorizeSvg(node.icon as string, cloudColor)
						)}"
						x={offsetX + node.x - node.w / 2}
						y={offsetY + node.y - node.h / 2}
						width={node.w}
						height={node.h}
					/>
				</g>
			{:else}
				<text
					x={offsetX + node.x}
					y={offsetY + node.y - node.h / 2 + node.ascent}
					font-size={node.fontSize}
					font-family={preferences.font}
					text-anchor="middle"
					fill={cloudColor}
					class="select-none"
				>
					{node.texts[0]}
				</text>
			{/if}
		{/if}
	{/each}
</g>
