<script lang="ts">
	import { Eye, EyeClosed, Layers } from '@lucide/svelte';

	let { layers = $bindable() } = $props();

	function toggleLayer(layer: keyof typeof layers) {
		layers[layer] = !layers[layer];
	}
</script>

<div class="absolute top-4 right-4 z-10 flex flex-col gap-2 rounded-lg bg-white/50 p-2 shadow-sm">
	<div class="mb-1 flex items-center gap-2 px-1 text-[10px] font-bold text-gray-400 uppercase">
		<Layers size="12" /> LAYERS
	</div>
	<button onclick={() => toggleLayer('hull')} class="layer-btn" class:active={layers.hull}>
		{#if layers.hull}
			<Eye size={16} />
		{:else}
			<EyeClosed size={16} />
		{/if} Hull
	</button>

	<button onclick={() => toggleLayer('clouds')} class="layer-btn" class:active={layers.clouds}>
		{#if layers.clouds}
			<Eye size={16} />
		{:else}
			<EyeClosed size={16} />
		{/if} Clouds
	</button>

	<button onclick={() => toggleLayer('points')} class="layer-btn" class:active={layers.points}>
		{#if layers.points}
			<Eye size={16} />
		{:else}
			<EyeClosed size={16} />
		{/if}
		Docs
	</button>

	<button onclick={() => toggleLayer('bbs')} class="layer-btn" class:active={layers.bbs}>
		{#if layers.bbs}
			<Eye size={16} />
		{:else}
			<EyeClosed size={16} />
		{/if}
		BBS
	</button>
</div>
