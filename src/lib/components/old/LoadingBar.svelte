<script>
	let { uploadProgress } = $props();
</script>

<div>
	<div class="h-4 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner">
		<div
			class="flex h-full items-center justify-center bg-linear-to-r from-blue-500 to-blue-700 text-[10px] font-bold text-white transition-all duration-300 ease-out"
			style="width: {uploadProgress}%"
		>
			{parseInt(uploadProgress)}%
		</div>
	</div>
	<p class="mt-2 animate-pulse text-center text-xs text-gray-500">
		{uploadProgress < 40 ? 'Subiendo archivos...' : 'Ejecutando NLP & TF-IDF en paralelo...'}
	</p>
</div>
