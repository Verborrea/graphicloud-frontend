<script>
	import { Monitor, Moon, Sun } from '@lucide/svelte';
	import Block from '$lib/components/blocks/Block.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import { fonts, limits } from '$lib/const';
	import { getProgress, handleNumericInput } from '$lib/utils';

	let { font = $bindable(), fontSize = $bindable(), theme = $bindable() } = $props();

	let errors = $derived({
		fontRange: fontSize.min >= fontSize.max,
		fontMin: fontSize.min < limits.font.min,
		fontMax: fontSize.max > limits.font.max
	});
</script>

<Block title="PREFERENCES">
	<div class="flex flex-col gap-3 px-2">
		<Select name="font" label="Font Family" bind:value={font} options={fonts} />
		<div class="flex flex-col gap-1">
			<p class="text-sm font-bold">Font Size</p>
			<div class="flex items-center gap-3">
				<input
					type="text"
					value={fontSize.min}
					oninput={(e) => handleNumericInput(e, (v) => (fontSize.min = v))}
					class="input"
					class:error={errors.fontMin || errors.fontRange}
				/>

				<div class="relative flex h-6 flex-1 items-center">
					<div class="absolute h-1.5 w-full rounded-lg bg-gray-200"></div>
					<div
						class="absolute h-1.5 rounded-lg bg-primary"
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
					oninput={(e) => handleNumericInput(e, (v) => (fontSize.max = v))}
					class="input"
					class:error={errors.fontMax || errors.fontRange}
				/>
			</div>

			{#if errors.fontRange}
				<p class="text-center text-[10px] text-rose-500">Mínimo no puede ser mayor que máximo</p>
			{:else if errors.fontMin || errors.fontMax}
				<p class="text-center text-[10px] text-rose-500">
					Rango permitido: {limits.font.min} - {limits.font.max}
				</p>
			{/if}
		</div>
		<div class="grid grid-cols-3 gap-2">
			<button
				type="button"
				class="btn"
				class:primary={theme === 0}
				class:secondary={theme !== 0}
				onclick={() => (theme = 0)}
			>
				<Monitor />
			</button>
			<button
				type="button"
				class="btn"
				class:primary={theme === 1}
				class:secondary={theme !== 1}
				onclick={() => (theme = 1)}
			>
				<Sun />
			</button>
			<button
				type="button"
				class="btn"
				class:primary={theme === 2}
				class:secondary={theme !== 2}
				onclick={() => (theme = 2)}
			>
				<Moon />
			</button>
		</div>
	</div>
</Block>
