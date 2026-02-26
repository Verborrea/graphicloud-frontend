<script>
	import Block from '$lib/components/blocks/Block.svelte';
	import { cloudState } from '$lib/state.svelte';
</script>

<Block title="MODE">
	<div class="grid grid-cols-2 gap-2 px-2">
		<button
			type="button"
			class="btn"
			class:primary={cloudState.global === false}
			class:secondary={cloudState.global !== false}
			onclick={() => (cloudState.global = false)}
		>
			Local
		</button>
		<button
			type="button"
			class="btn"
			class:primary={cloudState.global === true}
			class:secondary={cloudState.global !== true}
			onclick={() => (cloudState.global = true)}
		>
			Global
		</button>
	</div>
</Block>
