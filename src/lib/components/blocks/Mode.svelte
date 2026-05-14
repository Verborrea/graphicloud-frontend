<script>
	import Block from '$lib/components/blocks/Block.svelte';
	import { mode } from '$lib/state.svelte';
</script>

<Block title="MODE">
	<div class="grid grid-cols-2 gap-2">
		<button
			type="button"
			class="btn"
			class:primary={mode.mode === 'local'}
			class:secondary={mode.mode === 'global'}
			onclick={() => (mode.mode = 'local')}
		>
			Local
		</button>
		<button
			type="button"
			class="btn"
			class:primary={mode.mode === 'global'}
			class:secondary={mode.mode === 'local'}
			onclick={() => (mode.mode = 'global')}
		>
			Global
		</button>
	</div>
</Block>
