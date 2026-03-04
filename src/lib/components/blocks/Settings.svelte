<script lang="ts">
	import Block from '$lib/components/blocks/Block.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import { algorithms, limits } from '$lib/const';
	import { cloudState } from '$lib/state.svelte';
	import { handleNumericInput, getProgress, validateRange } from '$lib/utils';

	let errors = $derived({
		keywords:
			cloudState.keywordsCount < limits.keywords.min ||
			cloudState.keywordsCount > limits.keywords.max,
		range: cloudState.range < limits.range.min || cloudState.range > limits.range.max
	});
</script>

<Block title="SETTINGS">
	<div class="flex flex-col gap-3 px-2">
		<Select name="algo" label="Algorithm" bind:value={cloudState.algorithm} options={algorithms} />
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
						bind:value={cloudState.keywordsCount}
						class="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-primary"
						style="background: linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) {getProgress(
							cloudState.keywordsCount,
							limits.keywords.min,
							limits.keywords.max
						)}%, #e5e7eb {getProgress(
							cloudState.keywordsCount,
							limits.keywords.min,
							limits.keywords.max
						)}%, #e5e7eb 100%)"
					/>
				</div>
				<span>{limits.keywords.max}</span>
				<input
					type="text"
					value={cloudState.keywordsCount}
					oninput={(e) => handleNumericInput(e, (v) => (cloudState.keywordsCount = v))}
					onblur={() =>
						validateRange(
							cloudState.keywordsCount,
							limits.keywords.min,
							limits.keywords.max,
							(v) => (cloudState.keywordsCount = v)
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
		<div class="flex flex-col gap-1">
			<label for="range" class="text-sm font-bold">Range Scale</label>
			<div class="flex items-center gap-4">
				<span>{limits.range.min}</span>
				<div class="relative flex flex-1 items-center">
					<input
						id="range"
						type="range"
						min={limits.range.min}
						max={limits.range.max}
						bind:value={cloudState.range}
						class="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-primary"
						style="background: linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) {getProgress(
							cloudState.range,
							limits.range.min,
							limits.range.max
						)}%, #e5e7eb {getProgress(
							cloudState.range,
							limits.range.min,
							limits.range.max
						)}%, #e5e7eb 100%)"
					/>
				</div>
				<span>{limits.range.max}</span>
				<input
					type="text"
					value={cloudState.range}
					oninput={(e) => handleNumericInput(e, (v) => (cloudState.range = v))}
					onblur={() =>
						validateRange(
							cloudState.range,
							limits.range.min,
							limits.range.max,
							(v) => (cloudState.range = v)
						)}
					class="input"
					class:error={errors.range}
				/>
			</div>
			{#if errors.range}
				<p class="text-[10px] text-rose-500">
					Debe estar entre {limits.range.min} y {limits.range.max}
				</p>
			{/if}
		</div>
	</div>
</Block>
