<script>
	import { Monitor, Moon, Sun } from '@lucide/svelte';
	import Block from '$lib/components/blocks/Block.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import { fonts, limits } from '$lib/const';
	import { getProgress, handleNumericInput } from '$lib/utils';
	import { preferences } from '$lib/state.svelte';

	let errors = $derived({
		fontRange: preferences.minFontSize >= preferences.maxFontSize,
		fontMin: preferences.minFontSize < limits.font.min,
		fontMax: preferences.maxFontSize > limits.font.max
	});
</script>

<Block title="PREFERENCES">
	<div class="flex flex-col gap-3">
		<Select name="font" label="Font Family" bind:value={preferences.font} options={fonts} />
		<div class="flex flex-col gap-1">
			<p class="text-sm font-bold">Font Size</p>
			<div class="flex items-center gap-3">
				<input
					type="text"
					value={preferences.minFontSize}
					oninput={(e) => handleNumericInput(e, (v) => (preferences.minFontSize = v))}
					class="input"
					class:error={errors.fontMin || errors.fontRange}
				/>

				<div class="relative flex h-6 flex-1 items-center">
					<div class="absolute h-1.5 w-full rounded-lg bg-slate-200"></div>
					<div
						class="absolute h-1.5 rounded-lg bg-primary"
						style:left="{getProgress(preferences.minFontSize, limits.font.min, limits.font.max)}%"
						style:right="{100 -
							getProgress(preferences.maxFontSize, limits.font.min, limits.font.max)}%"
					></div>

					<input
						type="range"
						min={limits.font.min}
						max={limits.font.max}
						bind:value={preferences.minFontSize}
						class="range-input"
					/>
					<input
						type="range"
						min={limits.font.min}
						max={limits.font.max}
						bind:value={preferences.maxFontSize}
						class="range-input"
					/>
				</div>

				<input
					type="text"
					value={preferences.maxFontSize}
					oninput={(e) => handleNumericInput(e, (v) => (preferences.maxFontSize = v))}
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
				class:primary={preferences.theme === 0}
				class:secondary={preferences.theme !== 0}
				onclick={() => (preferences.theme = 0)}
			>
				<Monitor />
			</button>
			<button
				type="button"
				class="btn"
				class:primary={preferences.theme === 1}
				class:secondary={preferences.theme !== 1}
				onclick={() => (preferences.theme = 1)}
			>
				<Sun />
			</button>
			<button
				type="button"
				class="btn"
				class:primary={preferences.theme === 2}
				class:secondary={preferences.theme !== 2}
				onclick={() => (preferences.theme = 2)}
			>
				<Moon />
			</button>
		</div>
	</div>
</Block>
