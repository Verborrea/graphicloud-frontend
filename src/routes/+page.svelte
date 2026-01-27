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
	let results = $state<Result[]>([]);

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
		results = [];

		const formData = new FormData();
		files.forEach((file) => formData.append('files', file));
		formData.append('n_top', nTop.toString()); // Enviamos el valor del slider

		try {
			const xhr = new XMLHttpRequest();
			xhr.open('POST', 'http://localhost:8000/convert-pdfs/', true);

			// Fase 1: Progreso de subida (mapeado de 0 a 40%)
			xhr.upload.onprogress = (event) => {
				if (event.lengthComputable) {
					uploadProgress = Math.round((event.loaded / event.total) * 40);
					if (uploadProgress >= 40 && !progressInterval) {
						startProcessingSimulation();
					}
				}
			};

			// Fase 2: Simulación de procesamiento (de 40 a 95%)
			function startProcessingSimulation() {
				progressInterval = setInterval(() => {
					if (uploadProgress < 95) {
						// Avanza más lento a medida que se acerca al 95
						const increment = (95 - uploadProgress) * 0.1;
						uploadProgress = Math.round(uploadProgress + increment);
					}
				}, 400);
			}

			xhr.onload = () => {
				clearInterval(progressInterval);
				if (xhr.status === 200) {
					uploadProgress = 100;
					results = JSON.parse(xhr.responseText);
				} else {
					const res = JSON.parse(xhr.responseText);
					error = `Error (${xhr.status}): ${res.detail || 'Fallo en el servidor'}`;
				}
				isLoading = false;
			};

			xhr.onerror = () => {
				clearInterval(progressInterval);
				error = 'Error de red. ¿Está el backend en el puerto 8000?';
				isLoading = false;
			};

			xhr.send(formData);
		} catch (err: any) {
			error = err.message;
			isLoading = false;
		}
	}

	function reset() {
		files = [];
		isLoading = false;
		uploadProgress = 0;
		error = null;
		results = [];
		if (progressInterval) clearInterval(progressInterval);
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100 p-4 font-sans text-gray-900">
	<div
		class="flex w-full max-w-2xl flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl"
	>
		<h1 class="text-center text-3xl font-extrabold tracking-tight text-gray-800">GraphiCloud</h1>
		<FileDropper bind:files {handleDrop} {handleFileSelect} />
		<div class="rounded-xl border border-gray-100 bg-gray-50 p-4">
			<div class="mb-2 flex items-center justify-between">
				<label for="nTop" class="text-sm font-bold text-gray-700"
					>Palabras clave por documento:</label
				>
				<span class="rounded-full bg-blue-600 px-3 py-1 font-mono text-xs text-white">{nTop}</span>
			</div>
			<input
				type="range"
				id="nTop"
				min="5"
				max="30"
				step="1"
				bind:value={nTop}
				class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-blue-200 accent-blue-600"
			/>
		</div>
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
				{canAnalyze ? 'Analizar Documentos' : 'Mínimo 3 Documentos'}
			</button>
			<button onclick={reset} disabled={isLoading} class="btn btn-secondary"> Limpiar </button>
		</div>
		{#if results.length > 0}
			<DocumentMap docs={results} />
			<div class="space-y-3">
				<h3 class="text-lg font-bold text-gray-800">Detalle por Documento</h3>
				{#each results as item}
					<DocumentResult {item} />
				{/each}
			</div>
		{/if}
	</div>
</div>
