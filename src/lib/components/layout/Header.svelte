<script>
	import { Cloud, PanelLeft } from '@lucide/svelte';
	import ZoomControl from './ZoomControl.svelte';

	let { offset, scale = $bindable(), isSidebarOpen = $bindable() } = $props();
</script>

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
