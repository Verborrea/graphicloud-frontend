<script lang="ts">
	import { configState, cloudState } from '$lib/state.svelte';

	let { cloudId, isGlobal = false } = $props();

	const cloudData = $derived(
		isGlobal ? cloudState.global : cloudState.locals.find((l) => l.id === cloudId)
	);

	const nodes = $derived(cloudData?.nodes ?? []);
	const cloudColor = $derived(cloudData?.color ?? '#111');
</script>

<g class="word-cloud">
	{#each nodes as node}
		{#if configState.layers.bb}
			<rect
				x={node.rectX}
				y={node.rectY}
				width={node.width}
				height={node.ascent + node.descent}
				fill="none"
				stroke={cloudColor}
				stroke-width="0.5"
			/>
		{/if}

		{#if configState.layers.wc}
			<text
				x={node.x}
				y={node.y}
				font-size={node.fontSize}
				font-family={configState.font}
				text-anchor="middle"
				fill={cloudColor}
				class="transition-opacity select-none"
			>
				{node.text}
			</text>
		{/if}
	{/each}
</g>
