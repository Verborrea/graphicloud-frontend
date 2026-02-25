<script>
	import { FileText } from '@lucide/svelte';

	let { file } = $props();
</script>

<div class="flex items-center gap-1 text-start text-sm text-gray-500">
	<FileText class="shrink-0" size={16} />
	<span class="truncate leading-[1.2]">{file.name}</span>
	<span class="shrink-0 text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
</div>
