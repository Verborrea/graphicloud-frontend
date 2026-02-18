<script>
	import Block from './Block.svelte';
	import LayerItem from '../LayerItem.svelte';

	let layers = $state([
		{ id: 1, name: 'Documents', active: true },
		{ id: 2, name: 'Convex Hull', active: true },
		{ id: 3, name: 'Word Clouds', active: true },
		{ id: 4, name: 'Bounding Boxes', active: true }
	]);
</script>

<Block title="LAYERS">
	<div class="flex flex-col gap-0.5">
		{#each layers as layer (layer.id)}
			<LayerItem label={layer.name} bind:checked={layer.active} />
		{/each}
	</div>
</Block>
