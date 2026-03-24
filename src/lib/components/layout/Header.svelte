<script>
	import { selectState } from '$lib/state.svelte';
	import { Cloud, Minus, PanelLeft, Plus, SquareDashedMousePointer } from '@lucide/svelte';

	let { offset, scale = $bindable(), isSidebarOpen = $bindable() } = $props();

	function reset() {
		offset.x = 0;
		offset.y = 0;
		scale = 1;
	}
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
	<section class="flex h-18.5 items-center justify-between gap-6 px-6">
		<button
			type="button"
			class="btn-icon p-2"
			class:primary={selectState.active}
			class:secondary={!selectState.active}
			title="Modo selección lazo"
			onclick={() => {
				selectState.active = !selectState.active;
				if (!selectState.active) {
					selectState.words = [];
					selectState.lassoPoints = [];
				}
			}}
		>
			<SquareDashedMousePointer size={16} />
		</button>
		<div class="flex items-center gap-6 font-mono font-medium">
			<button
				type="button"
				onclick={reset}
				class="btn-icon secondary px-5 py-1.5 leading-none"
				aria-label="Reset zoom">Reset View</button
			>
			<span>x: {Math.round(offset.x)}</span>
			<span>y: {Math.round(offset.y)}</span>
			<div class="flex items-center gap-2">
				<button
					type="button"
					onclick={() => (scale = Math.max(0.1, scale - 0.1))}
					class="btn-icon secondary"
					aria-label="Less zoom"><Minus /></button
				>
				<span class="w-9 text-center font-mono">{Math.round(scale * 100)}%</span>
				<button
					type="button"
					onclick={() => (scale = Math.min(5, scale + 0.1))}
					class="btn-icon secondary"
					aria-label="More zoom"><Plus /></button
				>
			</div>
		</div>
	</section>
</header>
