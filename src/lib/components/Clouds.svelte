<script lang="ts">
	import { onMount } from 'svelte';
	import { cloudState } from '$lib/state.svelte';
	import type { WordNode } from '$lib/types';
	import { measureWord } from '$lib/measureWord';

	const initial = [
		{ id: 1, x: 100, y: 100, text: 'Hola mundo', fontSize: 24 },
		{ id: 2, x: 300, y: 200, text: 'Svelte 5', fontSize: 32 },
		{ id: 3, x: 150, y: 300, text: 'El pepe', fontSize: 18 },
		{ id: 4, x: 250, y: 300, text: 'Canvas', fontSize: 64 }
	];

	let nodes = $state<WordNode[]>([]);

	onMount(async () => {
		nodes = await Promise.all(
			initial.map(async (n) => {
				const { width, ascent, descent } = await measureWord(n.text, n.fontSize, cloudState.font);
				return {
					...n,
					width,
					height: ascent + descent,
					ascent
				};
			})
		);
	});
</script>

{#each nodes as node (node.id)}
	{#if cloudState.layers.bb}
		<rect
			x={node.x}
			y={node.y - node.ascent}
			width={node.width}
			height={node.height}
			fill="none"
			stroke="#3b82f6"
			stroke-width="0.5"
		/>
	{/if}

	<text x={node.x} y={node.y} font-size={node.fontSize} font-family={cloudState.font} fill="#111">
		{node.text}
	</text>
{/each}
