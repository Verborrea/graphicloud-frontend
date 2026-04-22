<script lang="ts">
	import toast from 'svelte-hot-french-toast';
	import { lassoState } from '$lib/state.svelte';
	import { X } from '@lucide/svelte';

	async function generateImage() {
		if (lassoState.isLoadingImage) return;

		lassoState.isLoadingImage = true;
		try {
			const res = await fetch('http://localhost:8000/select-icon', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ keywords: lassoState.words })
			});

			if (!res.ok) throw new Error('Failed to fetch icon');

			const { svg } = await res.json();
			lassoState.svg = svg;
			clearSelection();

			console.log(svg);
		} catch (err: any) {
			toast.error(err.message);
		} finally {
			lassoState.isLoadingImage = false;
		}
	}

	function clearSelection() {
		lassoState.words = [];
		lassoState.lassoPoints = [];
	}

	const count = $derived(lassoState.words.length);
	const preview = $derived(lassoState.words.map((w) => w.word).join(', '));
</script>

<div class="fixed bottom-8 left-1/2 z-50 -translate-x-1/2">
	{#if count > 0}
		<div
			class="group relative flex w-fit max-w-[calc(100vw-48px)] items-center gap-3 rounded-lg border border-border bg-white p-3"
		>
			<div class="flex items-center gap-2 overflow-hidden text-sm">
				<span class="font-semibold whitespace-nowrap text-slate-900">
					{count}
					{count === 1 ? 'word' : 'words'} selected:
				</span>
				<span class="max-w-50 truncate text-slate-500">
					{preview}
				</span>
			</div>
			<div class="flex items-center gap-2">
				<button
					onclick={generateImage}
					disabled={lassoState.isLoadingImage}
					class="btn primary h-9 rounded-md px-3 text-sm font-medium"
				>
					{lassoState.isLoadingImage ? 'Generating...' : 'Generate image'}
				</button>
			</div>
			<button
				type="button"
				onclick={clearSelection}
				class="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-red-600"
				aria-label="Clear"
			>
				<X size={16} strokeWidth={3} />
			</button>
		</div>
	{/if}
</div>
