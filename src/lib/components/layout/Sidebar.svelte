<script lang="ts">
	import Documents from '../blocks/Documents.svelte';
	import Mode from '../blocks/Mode.svelte';
	import Layers from '../blocks/Layers.svelte';
	import Settings from '../blocks/Settings.svelte';
	import Preferences from '../blocks/Preferences.svelte';
	import { cloudState } from '$lib/state.svelte';

	let { isSidebarOpen } = $props();
</script>

<aside
	class="h-full shrink-0 overflow-hidden border-r border-border bg-gray-50 text-sm font-medium transition-[width] duration-500 ease-in-out"
	style="width: {isSidebarOpen ? '320px' : '0px'}"
>
	<div class="w-[320px]">
		<Documents />
		{#if cloudState.files.length > 0}
			<Mode />
			<Layers />
			<Settings />
			<Preferences />
		{/if}
	</div>
</aside>
