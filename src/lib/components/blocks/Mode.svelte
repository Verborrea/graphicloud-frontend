<script>
	import Block from './Block.svelte';

	let { global = $bindable() } = $props();
</script>

<Block title="MODE">
	<div class="grid grid-cols-2 gap-2 px-2">
		<button
			type="button"
			class="btn"
			class:primary={global === false}
			class:secondary={global !== false}
			onclick={() => (global = false)}
		>
			Local
		</button>
		<button
			type="button"
			class="btn"
			class:primary={global === true}
			class:secondary={global !== true}
			onclick={() => (global = true)}
		>
			Global
		</button>
	</div>
</Block>
