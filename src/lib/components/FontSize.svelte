<script>
	let { zoom = $bindable(), minSize = $bindable(), maxSize = $bindable() } = $props();
</script>

<div
	class="absolute right-4 bottom-4 z-10 flex w-48 flex-col gap-3 rounded-lg bg-white/50 p-2 shadow-sm"
>
	<div class="flex flex-col gap-1">
		<div class="flex justify-between text-[10px] font-medium text-gray-600">
			<span>Scale: {zoom / 10}</span>
		</div>
		<input type="range" min="100" max="1000" bind:value={zoom} class="h-1 w-full accent-blue-600" />
	</div>

	<div class="flex flex-col gap-1">
		<div class="flex justify-between text-[10px] font-medium text-gray-600">
			<span>Min: {minSize}px</span>
		</div>
		<input type="range" min="5" max="20" bind:value={minSize} class="h-1 w-full accent-blue-600" />
	</div>

	<div class="flex flex-col gap-1">
		<div class="flex justify-between text-[10px] font-medium text-gray-600">
			<span>Max: {maxSize}px</span>
		</div>
		<input type="range" min="20" max="80" bind:value={maxSize} class="h-1 w-full accent-blue-600" />
	</div>
</div>
