<script>
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import ZoomControl from '$lib/components/layout/ZoomControl.svelte';
	import WorkArea from '$lib/components/WorkArea.svelte';
	import { Cloud, PanelLeft } from '@lucide/svelte';

	let isSidebarOpen = $state(true);

	let offset = $state({ x: 0, y: 0 });
	let scale = $state(1);
</script>

<svelte:head>
	<title>GraphiCloud</title>
</svelte:head>

<header class="grid grid-cols-[320px_1fr] border-b border-border bg-gray-50 text-sm">
	<section class="flex items-center justify-between gap-2 border-r border-border p-6">
		<h1 class="flex items-center gap-2">
			<div class="center size-6 rounded-md bg-primary text-white">
				<Cloud size={16} strokeWidth={2.5} />
			</div>
			<span class="text-lg leading-6 font-bold tracking-tight">GraphiCloud</span>
		</h1>
		<button
			type="button"
			onclick={() => (isSidebarOpen = !isSidebarOpen)}
			class="btn-icon ghost -mr-1"
		>
			<PanelLeft />
		</button>
	</section>
	<section class="flex items-center justify-end gap-6 p-6 font-mono font-medium">
		<span>x: {Math.round(offset.x)}</span>
		<span>y: {Math.round(offset.y)}</span>
		<ZoomControl bind:scale />
	</section>
</header>
<div class="relative flex h-screen w-screen flex-col overflow-hidden">
	<Sidebar {isSidebarOpen} />
	<WorkArea bind:offset bind:scale />
</div>
