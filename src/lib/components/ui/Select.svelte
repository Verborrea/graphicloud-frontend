<script>
	import { ChevronsUpDown } from '@lucide/svelte';

	let { name, label, value = $bindable(), options } = $props();

	const id = Math.random().toString(36).substring(2, 9);
</script>

<div class="grid gap-1">
	<label class="font-bold" for={id}>{label}</label>
	<div class="relative">
		<select {id} {name} bind:value class="select">
			{#each options as algo}
				<option value={algo.value}>{algo.text}</option>
			{/each}
		</select>
		<div class="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-gray-400">
			<ChevronsUpDown size={16} />
		</div>
	</div>
</div>
