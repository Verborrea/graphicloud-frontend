<script lang="ts">
	import Block from '$lib/components/blocks/Block.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import { algorithms, limits } from '$lib/const';
	import { settings } from '$lib/state.svelte';
	import { handleNumericInput, getProgress, validateRange } from '$lib/utils';
	import LayerItem from '../ui/LayerItem.svelte';

	let errors = $derived({
		keywords:
			settings.keywordsCount < limits.keywords.min || settings.keywordsCount > limits.keywords.max
	});
</script>

<Block title="SETTINGS">
	<div class="flex flex-col gap-3">
		<Select name="algo" label="Algorithm" bind:value={settings.algorithm} options={algorithms} />
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
						bind:value={settings.keywordsCount}
						class="range-input"
						style="background: linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) {getProgress(
							settings.keywordsCount,
							limits.keywords.min,
							limits.keywords.max
						)}%, #e5e7eb {getProgress(
							settings.keywordsCount,
							limits.keywords.min,
							limits.keywords.max
						)}%, #e5e7eb 100%)"
					/>
				</div>
				<span>{limits.keywords.max}</span>
				<input
					type="text"
					value={settings.keywordsCount}
					oninput={(e) => handleNumericInput(e, (v) => (settings.keywordsCount = v))}
					onblur={() =>
						validateRange(
							settings.keywordsCount,
							limits.keywords.min,
							limits.keywords.max,
							(v) => (settings.keywordsCount = v)
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
			<span class="text-sm font-bold">Generation Mode</span>
			<div class="grid grid-cols-2 gap-2">
				<button
					type="button"
					class="btn"
					class:primary={settings.generationMode === 'parallel'}
					class:secondary={settings.generationMode === 'sequential'}
					onclick={() => (settings.generationMode = 'parallel')}
				>
					Parallel
				</button>
				<button
					type="button"
					class="btn"
					class:primary={settings.generationMode === 'sequential'}
					class:secondary={settings.generationMode === 'parallel'}
					onclick={() => (settings.generationMode = 'sequential')}
				>
					Sequential
				</button>
			</div>
		</div>
		<LayerItem label="Sort by Importance" bind:checked={settings.sortByImportance} />
	</div>
</Block>
