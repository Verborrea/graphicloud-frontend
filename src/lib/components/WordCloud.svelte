<script lang="ts">
	import { gclouds, layers, preferences } from '$lib/state.svelte';

	let { cloudId, isGlobal = false, offsetX = 0, offsetY = 0 } = $props();

	const cloudData = $derived(
		isGlobal ? gclouds.global : gclouds.locals.find((l) => l.id === cloudId)
	);

	const nodes = $derived(cloudData?.nodes ?? []);
	const cloudColor = $derived(cloudData?.color ?? '#000000');
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
				<image
					href="data:image/svg+xml,{encodeURIComponent(
						(node.icon as string).replace('currentColor', cloudColor)
					)}"
					x={offsetX + node.x - node.w / 2}
					y={offsetY + node.y - node.h / 2}
					width={node.w}
					height={node.h}
				/>
			{:else}
				<text
					x={offsetX + node.x}
					y={offsetY + node.y}
					font-size={node.fontSize}
					font-family={preferences.font}
					text-anchor="middle"
					dominant-baseline="middle"
					fill={cloudColor}
					class="select-none"
				>
					{node.texts[0]}
				</text>
			{/if}
		{/if}
	{/each}
</g>
