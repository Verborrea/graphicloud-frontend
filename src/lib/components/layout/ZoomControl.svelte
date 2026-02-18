<script>
	import { Minus, Plus } from '@lucide/svelte';

	let { scale = $bindable() } = $props();
</script>

<div class="flex items-center gap-2">
	<button
		type="button"
		onclick={() => (scale = 1)}
		class="btn-icon secondary px-5 py-1.5 leading-none"
		aria-label="More zoom">Reset Zoom</button
	>
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
