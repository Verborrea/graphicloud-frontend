<script>
	import { ListChevronsDownUp, ListChevronsUpDown } from '@lucide/svelte';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	let { title, children } = $props();

	let opened = $state(true);

	const id = Math.random().toString(36).substring(2, 9);
</script>

<section class="border-b border-border px-4 py-6">
	<header class="flex items-center justify-between px-2 text-gray-400">
		<h2 class="text-xs font-bold tracking-wide uppercase" id="{id}-label">
			{title}
		</h2>
		<button
			type="button"
			class="btn-icon ghost -mr-1"
			onclick={() => (opened = !opened)}
			aria-expanded={opened}
			aria-controls="{id}-content"
			aria-labelledby="{id}-label"
			title={opened ? 'Colapsar sección' : 'Expandir sección'}
		>
			{#if opened}
				<ListChevronsDownUp class="size-3.5" />
			{:else}
				<ListChevronsUpDown class="size-3.5" />
			{/if}
		</button>
	</header>
	{#if opened}
		<div
			id="{id}-content"
			role="region"
			aria-labelledby="{id}-label"
			transition:slide={{ duration: 400, easing: quintOut }}
		>
			<div class="pt-4">
				{@render children()}
			</div>
		</div>
	{/if}
</section>
