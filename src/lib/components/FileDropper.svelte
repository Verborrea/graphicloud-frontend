<script lang="ts">
	import { CloudUpload } from '@lucide/svelte';
	import FileItem from './FileItem.svelte';

	let { files = $bindable(), handleDrop, handleFileSelect } = $props();

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
	}
</script>

<label
	for="fileInput"
	ondragover={handleDragOver}
	ondrop={handleDrop}
	class="group block cursor-pointer rounded-xl border-4 border-dashed border-blue-200 bg-blue-50 p-10 text-center text-blue-500 transition-all hover:border-blue-400 hover:bg-blue-100 hover:text-blue-600"
>
	<div class="flex flex-col items-center gap-1 transition-transform group-hover:scale-105">
		<span class="">
			<CloudUpload size="48" />
		</span>
		<p class="font-medium">Sueltas los papers o haz click aquí.</p>
	</div>
	<input
		type="file"
		id="fileInput"
		accept="application/pdf"
		multiple
		onchange={handleFileSelect}
		class="hidden"
	/>
</label>
{#if files.length > 0}
	<div class="space-y-1 rounded-lg border border-gray-100 bg-gray-50 p-3">
		{#each files as file}
			<FileItem {file} />
		{/each}
	</div>
{/if}
