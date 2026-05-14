<script>
	import Block from '$lib/components/blocks/Block.svelte';
	import LayerItem from '$lib/components/ui/LayerItem.svelte';
	import { layers, mode } from '$lib/state.svelte';
</script>

<Block title="LAYERS">
	<div class="flex flex-col gap-0.5">
		{#if mode.mode === 'local'}
			<LayerItem label="Documents" bind:checked={layers.docs} />
			<LayerItem label="Convex Hull" bind:checked={layers.hull} />
		{/if}
		<LayerItem label={mode.mode === 'global' ? 'Cloud' : 'Clouds'} bind:checked={layers.wc} />
		<LayerItem label="Bounding Boxes" bind:checked={layers.bb} />
	</div>
</Block>
