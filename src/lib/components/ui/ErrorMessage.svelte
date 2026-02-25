<script>
	import { TriangleAlert } from '@lucide/svelte';
	import { slide } from 'svelte/transition';

	let { errorMessage } = $props();
</script>

{#if errorMessage}
	<div
		transition:slide
		class="flex items-center gap-2 rounded-lg bg-rose-100 p-2 text-xs font-semibold text-rose-600"
	>
		<TriangleAlert size={16} strokeWidth={2.5} />
		{errorMessage}
	</div>
{/if}
