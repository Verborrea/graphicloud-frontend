<script>
	import { Monitor, Moon, Sun } from '@lucide/svelte';
	import Block from '$lib/components/blocks/Block.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import { fonts, limits } from '$lib/const';
	import { getProgress, handleNumericInput } from '$lib/utils';
	import { cloudState } from '$lib/state.svelte';

	let errors = $derived({
		fontRange: cloudState.minFontSize >= cloudState.maxFontSize,
		fontMin: cloudState.minFontSize < limits.font.min,
		fontMax: cloudState.maxFontSize > limits.font.max
	});
</script>

<Block title="PREFERENCES">
	<div class="flex flex-col gap-3 px-2">
		<Select name="font" label="Font Family" bind:value={cloudState.font} options={fonts} />
		<div class="flex flex-col gap-1">
			<p class="text-sm font-bold">Font Size</p>
			<div class="flex items-center gap-3">
				<input
					type="text"
					value={cloudState.minFontSize}
					oninput={(e) => handleNumericInput(e, (v) => (cloudState.minFontSize = v))}
					class="input"
					class:error={errors.fontMin || errors.fontRange}
				/>

				<div class="relative flex h-6 flex-1 items-center">
					<div class="absolute h-1.5 w-full rounded-lg bg-gray-200"></div>
					<div
						class="absolute h-1.5 rounded-lg bg-primary"
						style:left="{getProgress(cloudState.minFontSize, limits.font.min, limits.font.max)}%"
						style:right="{100 -
							getProgress(cloudState.maxFontSize, limits.font.min, limits.font.max)}%"
					></div>

					<input
						type="range"
						min={limits.font.min}
						max={limits.font.max}
						bind:value={cloudState.minFontSize}
						class="range-input"
					/>
					<input
						type="range"
						min={limits.font.min}
						max={limits.font.max}
						bind:value={cloudState.maxFontSize}
						class="range-input"
					/>
				</div>

				<input
					type="text"
					value={cloudState.maxFontSize}
					oninput={(e) => handleNumericInput(e, (v) => (cloudState.maxFontSize = v))}
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
				class:primary={cloudState.theme === 0}
				class:secondary={cloudState.theme !== 0}
				onclick={() => (cloudState.theme = 0)}
			>
				<Monitor />
			</button>
			<button
				type="button"
				class="btn"
				class:primary={cloudState.theme === 1}
				class:secondary={cloudState.theme !== 1}
				onclick={() => (cloudState.theme = 1)}
			>
				<Sun />
			</button>
			<button
				type="button"
				class="btn"
				class:primary={cloudState.theme === 2}
				class:secondary={cloudState.theme !== 2}
				onclick={() => (cloudState.theme = 2)}
			>
				<Moon />
			</button>
		</div>
	</div>
</Block>
