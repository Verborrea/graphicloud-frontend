<script lang="ts">
	import Block from '$lib/components/blocks/Block.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import { algorithms, limits } from '$lib/const';
	import { configState } from '$lib/state.svelte';
	import { handleNumericInput, getProgress, validateRange } from '$lib/utils';

	let errors = $derived({
		keywords:
			configState.keywordsCount < limits.keywords.min ||
			configState.keywordsCount > limits.keywords.max
	});
</script>

<Block title="SETTINGS">
	<div class="flex flex-col gap-3 px-2">
		<Select name="algo" label="Algorithm" bind:value={configState.algorithm} options={algorithms} />
		<div class="flex flex-col gap-1">
			<label for="keywords" class="text-sm font-bold">Keywords by document</label>
			<div class="flex items-center gap-4">
				<span>{limits.keywords.min}</span>
				<div class="relative flex flex-1 items-center">
					<input
						id="keywords"
						type="range"
						min={limits.keywords.min}
						max={limits.keywords.max}
						bind:value={configState.keywordsCount}
						class="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-primary"
						style="background: linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) {getProgress(
							configState.keywordsCount,
							limits.keywords.min,
							limits.keywords.max
						)}%, #e5e7eb {getProgress(
							configState.keywordsCount,
							limits.keywords.min,
							limits.keywords.max
						)}%, #e5e7eb 100%)"
					/>
				</div>
				<span>{limits.keywords.max}</span>
				<input
					type="text"
					value={configState.keywordsCount}
					oninput={(e) => handleNumericInput(e, (v) => (configState.keywordsCount = v))}
					onblur={() =>
						validateRange(
							configState.keywordsCount,
							limits.keywords.min,
							limits.keywords.max,
							(v) => (configState.keywordsCount = v)
						)}
					class="input"
					class:error={errors.keywords}
				/>
			</div>
			{#if errors.keywords}
				<p class="text-[10px] text-rose-500">
					Debe estar entre {limits.keywords.min} y {limits.keywords.max}
				</p>
			{/if}
		</div>
	</div>
</Block>
