<script>
	import Block from '$lib/components/blocks/Block.svelte';
	import { configState } from '$lib/state.svelte';
</script>

<Block title="MODE">
	<div class="grid grid-cols-2 gap-2 px-2">
		<button
			type="button"
			class="btn"
			class:primary={configState.global === false}
			class:secondary={configState.global !== false}
			onclick={() => (configState.global = false)}
		>
			Local
		</button>
		<button
			type="button"
			class="btn"
			class:primary={configState.global === true}
			class:secondary={configState.global !== true}
			onclick={() => (configState.global = true)}
		>
			Global
		</button>
	</div>
</Block>
