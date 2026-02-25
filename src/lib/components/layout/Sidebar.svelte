<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import Documents from '../blocks/Documents.svelte';
	import Mode from '../blocks/Mode.svelte';
	import Layers from '../blocks/Layers.svelte';
	import Settings from '../blocks/Settings.svelte';
	import Preferences from '../blocks/Preferences.svelte';

	let { isSidebarOpen } = $props();

	// Need to re-fetch the API
	let files = $state<File[]>([]);

	// No need to re-fetch the API
	// but need to re-run the WC algorithm
	let global = $state(false);
	let layers = $state([
		{ name: 'Documents', active: true },
		{ name: 'Convex Hull', active: true },
		{ name: 'Word Clouds', active: true },
		{ name: 'Bounding Boxes', active: true }
	]);
	let font = $state('Inter');
	let algorithm = $state('classic');
	let keywordsCount = $state(20);
	let fontSize = $state({ min: 16, max: 48 });
	let theme = $state(0);
</script>

{#if isSidebarOpen}
	<aside
		transition:fly={{ duration: 600, x: -320, opacity: 0, easing: quintOut }}
		class="fixed top-18.75 left-0 z-1 h-[calc(100%-75px)] w-[320px] overflow-y-scroll border-r border-border bg-gray-50 text-sm font-medium"
	>
		<Documents bind:files />
		{#if files.length > 0}
			<Mode bind:global />
			<Layers bind:layers />
			<Settings bind:algorithm bind:keywordsCount />
			<Preferences bind:font bind:fontSize bind:theme />
		{/if}
	</aside>
{/if}
