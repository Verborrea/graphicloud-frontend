<script lang="ts">
	import './app.css';

	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import WorkArea from '$lib/components/WorkArea.svelte';
	import Header from '$lib/components/layout/Header.svelte';

	let isSidebarOpen = $state(true);

	let offset = $state({ x: 0, y: 0 });
	let scale = $state(1);
</script>

<Header {offset} bind:scale bind:isSidebarOpen />
<div class="relative flex h-screen w-screen flex-col overflow-hidden">
	<Sidebar {isSidebarOpen} />
	<WorkArea bind:offset bind:scale />
</div>
