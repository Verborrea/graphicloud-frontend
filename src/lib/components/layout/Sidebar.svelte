<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import Documents from '../blocks/Documents.svelte';
	import Mode from '../blocks/Mode.svelte';
	import Layers from '../blocks/Layers.svelte';
	import Settings from '../blocks/Settings.svelte';
	import Preferences from '../blocks/Preferences.svelte';
	import { cloudState } from '$lib/state.svelte';

	let { isSidebarOpen } = $props();
</script>

{#if isSidebarOpen}
	<aside
		transition:fly={{ duration: 600, x: -320, opacity: 0, easing: quintOut }}
		class="fixed top-18.75 left-0 z-1 h-[calc(100%-75px)] w-[320px] overflow-y-scroll border-r border-border bg-gray-50 text-sm font-medium"
	>
		<Documents />
		{#if cloudState.files.length > 0}
			<Mode />
			<Layers />
			<Settings />
			<Preferences />
		{/if}
	</aside>
{/if}
