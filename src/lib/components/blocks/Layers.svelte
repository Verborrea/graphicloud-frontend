<script>
	import Block from '$lib/components/blocks/Block.svelte';
	import LayerItem from '$lib/components/ui/LayerItem.svelte';
	import { cloudState } from '$lib/state.svelte';
</script>

<Block title="LAYERS">
	<div class="flex flex-col gap-0.5">
		{#if !cloudState.global}
			<LayerItem label="Documents" bind:checked={cloudState.layers.docs} />
			<LayerItem label="Convex Hull" bind:checked={cloudState.layers.hull} />
		{/if}
		<LayerItem label={cloudState.global ? 'Cloud' : 'Clouds'} bind:checked={cloudState.layers.wc} />
		<LayerItem label="Bounding Boxes" bind:checked={cloudState.layers.bb} />
	</div>
</Block>
