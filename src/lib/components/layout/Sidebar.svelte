<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import Documents from '../blocks/Documents.svelte';
	import Mode from '../blocks/Mode.svelte';
	import Layers from '../blocks/Layers.svelte';
	import Settings from '../blocks/Settings.svelte';
	import Preferences from '../blocks/Preferences.svelte';

	let { isSidebarOpen } = $props();

	let global = $state(false);

	let files = $state<File[]>([]);
</script>

{#if isSidebarOpen}
	<aside
		transition:fly={{ duration: 600, x: -320, opacity: 0, easing: quintOut }}
		class="fixed left-0 z-1 w-[320px] overflow-y-scroll border-r border-border bg-gray-50 text-sm font-medium"
	>
		<Documents bind:files />
		{#if files.length > 0}
			<Mode bind:global />
			<Layers />
			<Settings />
			<Preferences />
		{/if}
	</aside>
{/if}

<style>
	aside {
		top: 75px;
		height: calc(100% - 75px);
	}
</style>
