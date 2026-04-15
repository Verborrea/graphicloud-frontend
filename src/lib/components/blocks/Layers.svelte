<script>
	import Block from '$lib/components/blocks/Block.svelte';
	import LayerItem from '$lib/components/ui/LayerItem.svelte';
	import { configState } from '$lib/state.svelte';
</script>

<Block title="LAYERS">
	<div class="flex flex-col gap-0.5">
		{#if !configState.global}
			<LayerItem label="Documents" bind:checked={configState.layers.docs} />
			<LayerItem label="Convex Hull" bind:checked={configState.layers.hull} />
		{/if}
		<LayerItem
			label={configState.global ? 'Cloud' : 'Clouds'}
			bind:checked={configState.layers.wc}
		/>
		<LayerItem label="Bounding Boxes" bind:checked={configState.layers.bb} />
	</div>
</Block>
