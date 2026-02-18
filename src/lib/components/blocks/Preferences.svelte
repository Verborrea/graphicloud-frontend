<script>
	import { Monitor, Moon, Sun } from '@lucide/svelte';
	import Block from './Block.svelte';

	let theme = $state(0);
</script>

<Block title="PREFERENCES">
	<div class="grid grid-cols-3 gap-2 px-2">
		<button
			type="button"
			class="btn"
			class:primary={theme === 0}
			class:secondary={theme !== 0}
			onclick={() => (theme = 0)}
		>
			<Monitor />
		</button>
		<button
			type="button"
			class="btn"
			class:primary={theme === 1}
			class:secondary={theme !== 1}
			onclick={() => (theme = 1)}
		>
			<Sun />
		</button>
		<button
			type="button"
			class="btn"
			class:primary={theme === 2}
			class:secondary={theme !== 2}
			onclick={() => (theme = 2)}
		>
			<Moon />
		</button>
	</div>
</Block>
