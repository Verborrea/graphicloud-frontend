<script>
	import { FileText } from '@lucide/svelte';

	let { item } = $props();
</script>

<div class="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm">
	<header class="flex items-center gap-1 truncate text-sm font-bold">
		<FileText size={16} class="shrink-0 stroke-[2.5]" />
		<p class="grow truncate">{item.filename}</p>
		<div class="flex gap-2">
			<span class="rounded bg-indigo-100 px-2 py-1 font-mono text-[10px] text-indigo-700"
				>X: {item.x.toFixed(3)}</span
			>
			<span class="rounded bg-emerald-100 px-2 py-1 font-mono text-[10px] text-emerald-700"
				>Y: {item.y.toFixed(3)}</span
			>
		</div>
	</header>
	<div class="flex flex-wrap gap-2">
		{#each item.keywords as kw}
			<span
				class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset"
			>
				{kw.word}
				<span class="ml-1 text-[10px] opacity-50">{Math.round(kw.score * 100)}%</span>
			</span>
		{/each}
	</div>
</div>
