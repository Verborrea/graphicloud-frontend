<script lang="ts">
	import Documents from '../blocks/Documents.svelte';
	import Mode from '../blocks/Mode.svelte';
	import Layers from '../blocks/Layers.svelte';
	import Settings from '../blocks/Settings.svelte';
	import Preferences from '../blocks/Preferences.svelte';
	import { configState } from '$lib/state.svelte';

	let { isSidebarOpen } = $props();
</script>

<aside
	class="h-full shrink-0 overflow-y-scroll border-border text-sm font-medium transition-[width] duration-500 ease-in-out {isSidebarOpen
		? 'border-r'
		: 'border-none'}"
	style="width: {isSidebarOpen ? '320px' : '0px'}"
>
	<div class="w-[320px]">
		<Documents />
		{#if configState.files.length > 0}
			<Mode />
			<Layers />
			<Settings />
			<Preferences />
		{/if}
	</div>
</aside>
