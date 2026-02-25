<script>
	import Block from './Block.svelte';
	import LayerItem from '../ui/LayerItem.svelte';

	let { layers = $bindable() } = $props();
</script>

<Block title="LAYERS">
	<div class="flex flex-col gap-0.5">
		{#each layers as layer (layer.name)}
			<LayerItem label={layer.name} bind:checked={layer.active} />
		{/each}
	</div>
</Block>
