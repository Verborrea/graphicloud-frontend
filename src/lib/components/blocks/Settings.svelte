<script lang="ts">
	import Block from './Block.svelte';
	import Select from '../ui/Select.svelte';

	const limits = {
		keywords: { min: 3, max: 30 },
		font: { min: 10, max: 72 }
	};

	const algorithms = [
		{
			value: 'classic',
			text: 'Classic Wordle'
		},
		{
			value: 'mani',
			text: 'ManiWordle'
		},
		{
			value: 'rl',
			text: 'RWordle-L'
		},
		{
			value: 'rc',
			text: 'RWordle-C'
		}
	];

	let algorithm = $state('classic');
	let keywordsCount = $state(20);
	let fontSize = $state({ min: 16, max: 48 });

	let errors = $derived({
		keywords: keywordsCount < limits.keywords.min || keywordsCount > limits.keywords.max,
		fontRange: fontSize.min >= fontSize.max,
		fontMin: fontSize.min < limits.font.min,
		fontMax: fontSize.max > limits.font.max
	});

	function handleNumericInput(e: Event, key: 'keywords' | 'min' | 'max') {
		const target = e.target as HTMLInputElement;
		const cleanValue = target.value.replace(/\D/g, '');
		const numValue = Number(cleanValue);

		if (key === 'keywords') keywordsCount = numValue;
		else fontSize[key] = numValue;
	}

	const getProgress = (val: number, min: number, max: number) => {
		const clamped = Math.min(Math.max(val, min), max);
		return ((clamped - min) / (max - min)) * 100;
	};
</script>

<Block title="SETTINGS">
	<div class="flex flex-col gap-3 px-2">
		<Select name="algo" label="Algorithm" bind:value={algorithm} options={algorithms} />
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
						bind:value={keywordsCount}
						class="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-primary"
						style="background: linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) {getProgress(
							keywordsCount,
							limits.keywords.min,
							limits.keywords.max
						)}%, #e5e7eb {getProgress(keywordsCount, 3, 30)}%, #e5e7eb 100%)"
					/>
				</div>
				<span>{limits.keywords.max}</span>
				<input
					type="text"
					value={keywordsCount}
					oninput={(e) => handleNumericInput(e, 'keywords')}
					class="input"
					class:error={errors.keywords}
				/>
			</div>
			{#if errors.keywords}
				<p class="text-[10px] text-red-500">
					Debe estar entre {limits.keywords.min} y {limits.keywords.max}
				</p>
			{/if}
		</div>

		<div class="flex flex-col gap-1">
			<p class="text-sm font-bold">Font Size</p>
			<div class="flex items-center gap-3">
				<input
					type="text"
					value={fontSize.min}
					oninput={(e) => handleNumericInput(e, 'min')}
					class="input"
					class:error={errors.fontMin || errors.fontRange}
				/>

				<div class="relative flex h-6 flex-1 items-center">
					<div class="absolute h-1.5 w-full rounded-lg bg-gray-200"></div>
					<div
						class="absolute h-1.5 rounded-lg bg-primary transition-all"
						style:left="{getProgress(fontSize.min, limits.font.min, limits.font.max)}%"
						style:right="{100 - getProgress(fontSize.max, limits.font.min, limits.font.max)}%"
					></div>

					<input
						type="range"
						min={limits.font.min}
						max={limits.font.max}
						bind:value={fontSize.min}
						class="range-input"
					/>
					<input
						type="range"
						min={limits.font.min}
						max={limits.font.max}
						bind:value={fontSize.max}
						class="range-input"
					/>
				</div>

				<input
					type="text"
					value={fontSize.max}
					oninput={(e) => handleNumericInput(e, 'max')}
					class="input"
					class:error={errors.fontMax || errors.fontRange}
				/>
			</div>

			{#if errors.fontRange}
				<p class="text-center text-[10px] text-red-500">Mínimo no puede ser mayor que máximo</p>
			{:else if errors.fontMin || errors.fontMax}
				<p class="text-center text-[10px] text-red-500">
					Rango permitido: {limits.font.min} - {limits.font.max}
				</p>
			{/if}
		</div>
	</div>
</Block>
