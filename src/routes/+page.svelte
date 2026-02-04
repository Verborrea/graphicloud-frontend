<script lang="ts">
	import type { Result } from '$lib/types';

	import FileDropper from '$lib/components/FileDropper.svelte';
	import DocumentResult from '$lib/components/DocumentResult.svelte';
	import DocumentMap from '$lib/components/DocumentMap.svelte';
	import LoadingBar from '$lib/components/LoadingBar.svelte';

	let files = $state<File[]>([]);
	let isLoading = $state(false);
	let uploadProgress = $state(0);
	let nTop = $state(10);
	let error = $state<string | null>(null);
	let rawResults = $state<Result[]>([]);

	let filteredResults: Result[] = $derived(
		rawResults.map((doc) => ({
			...doc,
			keywords: doc.keywords.slice(0, nTop)
		}))
	);

	let canAnalyze = $derived(files.length >= 3);
	let progressInterval: number;

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		const droppedFiles = Array.from(event.dataTransfer?.files || []);
		files.push(...droppedFiles.filter((file) => file.type === 'application/pdf'));
		error = null;
	}

	function handleFileSelect(event: Event) {
		const selectedFiles = Array.from((event.target as HTMLInputElement).files || []);
		files.push(...selectedFiles.filter((file) => file.type === 'application/pdf'));
		error = null;
	}

	async function uploadFiles() {
		if (files.length === 0) {
			error = 'Por favor, selecciona al menos un archivo PDF.';
			return;
		}

		if (!canAnalyze) {
			error = 'Se requieren al menos 3 archivos PDF para el análisis multidimensional.';
			return;
		}

		isLoading = true;
		uploadProgress = 0;
		error = null;
		rawResults = [];

		progressInterval = setInterval(() => {
			if (uploadProgress < 95) {
				uploadProgress += 0.5;
			}
		}, 200);

		const formData = new FormData();
		files.forEach((file) => formData.append('files', file));
		formData.append('n_top', nTop.toString()); // Enviamos el valor del slider

		try {
			const response = await fetch('http://localhost:8000/convert-pdfs/', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const errData = await response.json();
				throw new Error(errData.detail || 'Error en el servidor');
			}

			const data = await response.json();

			// Fin de la carga
			clearInterval(progressInterval);
			uploadProgress = 100;

			// Pequeño delay para que el usuario vea el 100% antes de mostrar resultados
			setTimeout(() => {
				rawResults = data;
				isLoading = false;
			}, 500);
		} catch (err: any) {
			clearInterval(progressInterval);
			error = err.message;
			isLoading = false;
		}
	}

	function reset() {
		files = [];
		isLoading = false;
		uploadProgress = 0;
		error = null;
		rawResults = [];
		if (progressInterval) clearInterval(progressInterval);
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100 p-4 font-sans text-gray-900">
	<div
		class="flex w-full max-w-2xl flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl"
	>
		<h1 class="text-center text-3xl font-extrabold tracking-tight text-gray-800">GraphiCloud</h1>
		<FileDropper bind:files {handleDrop} {handleFileSelect} />
		{#if isLoading}
			<LoadingBar {uploadProgress} />
		{/if}
		{#if error}
			<p class="error">
				⚠️ {error}
			</p>
		{/if}
		<div class="flex flex-col gap-2 sm:flex-row">
			<button
				onclick={uploadFiles}
				disabled={isLoading || !canAnalyze}
				class="btn btn-primary grow"
			>
				{canAnalyze ? 'Send' : '3 documents required'}
			</button>
			<button onclick={reset} disabled={isLoading} class="btn btn-secondary"> Clear </button>
		</div>
		<div class="rounded-xl border border-gray-100 bg-gray-50 p-4">
			<div class="mb-2 flex items-center justify-between">
				<label for="nTop" class="text-sm font-bold text-gray-700">Keywords by document:</label>
				<span class="rounded-full bg-blue-600 px-3 py-1 font-mono text-xs text-white">{nTop}</span>
			</div>
			<input
				type="range"
				id="nTop"
				min="3"
				max="30"
				step="1"
				bind:value={nTop}
				class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-blue-200 accent-blue-600"
			/>
		</div>
		{#if filteredResults.length > 0}
			<DocumentMap docs={filteredResults} />
			<div class="space-y-3">
				<h3 class="text-lg font-bold text-gray-800">Detalle por Documento</h3>
				{#each filteredResults as item}
					<DocumentResult {item} />
				{/each}
			</div>
		{/if}
	</div>
</div>
