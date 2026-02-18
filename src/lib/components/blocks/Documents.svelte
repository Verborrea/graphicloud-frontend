<script lang="ts">
	import { FileUp, FileText, Trash2, ExternalLink } from '@lucide/svelte';
	import { slide, fade } from 'svelte/transition';
	import Block from './Block.svelte';

	let { files = $bindable([]) }: { files: File[] } = $props();

	let isDragging = $state(false);
	let errorMessage = $state('');

	const validateAndAddFiles = (newFiles: FileList | File[]) => {
		errorMessage = '';
		const pdfs = Array.from(newFiles).filter((file) => {
			if (file.type !== 'application/pdf') {
				errorMessage = 'Only PDF files are allowed';
				return false;
			}
			return true;
		});

		files = [...files, ...pdfs];
		if (errorMessage) setTimeout(() => (errorMessage = ''), 3000);
	};

	// Función para abrir el PDF en una pestaña nueva
	const openFile = (file: File) => {
		const url = URL.createObjectURL(file);
		window.open(url, '_blank');
		// Es buena práctica liberar la memoria después de un tiempo si no se usa más,
		// pero para una pestaña nueva, el navegador lo gestiona bien.
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		isDragging = false;
		if (e.dataTransfer?.files) validateAndAddFiles(e.dataTransfer.files);
	};

	const handleFileInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		if (target.files) validateAndAddFiles(target.files);
	};
</script>

<Block title="DOCUMENTS">
	<div class="flex flex-col gap-2 px-2">
		{#if files.length === 0}
			<div
				role="button"
				tabindex="0"
				ondragover={(e) => {
					e.preventDefault();
					isDragging = true;
				}}
				ondragleave={() => (isDragging = false)}
				ondrop={handleDrop}
				class="relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-6 text-center transition-all
        {isDragging ? 'border-primary bg-blue-50/50' : 'border-gray-200 hover:border-primary/50'}"
			>
				<input
					type="file"
					multiple
					accept=".pdf"
					onchange={handleFileInput}
					class="absolute inset-0 cursor-pointer opacity-0"
				/>
				<FileUp size={48} class="text-primary" />
				<p class="text-lg leading-tight font-bold text-primary">Drag & Drop PDF documents</p>
				<button type="button" class="btn primary pointer-events-none">Or browse</button>
			</div>
		{/if}

		{#if errorMessage}
			<div
				transition:slide
				class="rounded-lg border border-red-100 bg-red-50 p-2 text-[10px] font-bold text-red-600"
			>
				{errorMessage}
			</div>
		{/if}

		{#if files.length > 0}
			<div class="flex max-h-60 flex-col overflow-y-auto pr-1">
				{#each files as file, i (file.name + i)}
					<div
						transition:fade={{ duration: 100 }}
						class="group flex items-center justify-between rounded-lg p-2 hover:bg-gray-100"
					>
						<div class="flex flex-1 items-center gap-2 overflow-hidden">
							<FileText size={16} class="shrink-0 text-primary" />
							<span class="truncate leading-none">{file.name}</span>
						</div>

						<div class="flex items-center">
							<button
								onclick={() => openFile(file)}
								class="-my-1 p-1.5 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:text-primary"
								title="Ver archivo"
							>
								<ExternalLink size={16} strokeWidth={2.5} />
							</button>
							<button
								onclick={() => (files = files.filter((_, idx) => idx !== i))}
								class="-my-1 p-1.5 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:text-red-500"
								title="Eliminar"
							>
								<Trash2 size={16} strokeWidth={2.5} />
							</button>
						</div>
					</div>
				{/each}
			</div>

			<div class="mt-2 grid grid-cols-2 gap-2">
				<button type="button" onclick={() => (files = [])} class="btn destructive">
					Clear all
				</button>

				<label class="btn secondary">
					<input type="file" multiple accept=".pdf" onchange={handleFileInput} class="hidden" />
					<span>Upload More</span>
				</label>
			</div>
		{/if}
	</div>
</Block>
