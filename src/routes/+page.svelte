<script lang="ts">
	import './app.css';

	import { Toaster } from 'svelte-hot-french-toast';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import WorkArea from '$lib/components/layout/WorkArea.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import SelectionPanel from '$lib/components/layout/SelectionPanel.svelte';

	let isSidebarOpen = $state(false);

	let offset = $state({ x: 0, y: 0 });
	let scale = $state(1);
</script>

<Toaster />
<Header {offset} bind:scale bind:isSidebarOpen />
<div class="flex h-[calc(100vh-75px)] w-screen overflow-hidden">
	<Sidebar {isSidebarOpen} />
	<WorkArea bind:offset bind:scale />
	<SelectionPanel />
</div>
