<script lang="ts">
	import Block from '$lib/components/blocks/Block.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import { algorithms, limits } from '$lib/const';
	import { cloudState } from '$lib/state.svelte';
	import { handleNumericInput, getProgress } from '$lib/utils';

	let errors = $derived({
		keywords:
			cloudState.keywordsCount < limits.keywords.min ||
			cloudState.keywordsCount > limits.keywords.max
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
						)}%, #e5e7eb {getProgress(cloudState.keywordsCount, 3, 30)}%, #e5e7eb 100%)"
					/>
				</div>
				<span>{limits.keywords.max}</span>
				<input
					type="text"
					value={cloudState.keywordsCount}
					oninput={(e) => handleNumericInput(e, (v) => (cloudState.keywordsCount = v))}
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
