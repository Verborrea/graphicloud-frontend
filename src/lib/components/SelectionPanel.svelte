<script lang="ts">
	import { selectState } from '$lib/state.svelte';

	async function generateImage() {
		selectState.isLoadingImage = true;
		try {
			const res = await fetch('/api/generate-image', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ words: selectState.words })
			});
			const { svg } = await res.json();
			selectState.svgOverlay = svg;
		} finally {
			selectState.isLoadingImage = false;
		}
	}

	function clearSelection() {
		selectState.words = [];
		selectState.lassoPoints = [];
		selectState.svgOverlay = null;
	}
</script>

<div
	class="absolute bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3
            rounded-xl border border-indigo-200 bg-white px-4 py-3 shadow-lg"
>
	<span class="text-sm font-medium text-slate-600">
		{selectState.words.length} palabra{selectState.words.length !== 1 ? 's' : ''} seleccionada{selectState
			.words.length !== 1
			? 's'
			: ''}
	</span>
	<div class="flex max-w-xs flex-wrap gap-1">
		{#each selectState.words.slice(0, 8) as w}
			<span class="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
				{w.text}
			</span>
		{/each}
		{#if selectState.words.length > 8}
			<span class="text-xs text-slate-400">+{selectState.words.length - 8} más</span>
		{/if}
	</div>
	<button
		onclick={generateImage}
		disabled={selectState.isLoadingImage}
		class="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white
           transition-colors hover:bg-indigo-700 disabled:opacity-50"
	>
		{selectState.isLoadingImage ? 'Generando...' : 'Generar imagen'}
	</button>
	<button onclick={clearSelection} class="text-lg leading-none text-slate-400 hover:text-slate-600">
		✕
	</button>
</div>
