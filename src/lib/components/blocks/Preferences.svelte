<script>
	import Block from '$lib/components/blocks/Block.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import { fonts, limits } from '$lib/const';
	import { getProgress, handleInput } from '$lib/utils';
	import { preferences } from '$lib/state.svelte';

	let error = $derived(preferences.minFontSize >= preferences.maxFontSize);
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
					onchange={(e) =>
						handleInput(e, (v) => (preferences.minFontSize = v), limits.font.min, limits.font.max)}
					class="input"
					class:error
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
						class:error
					/>
					<input
						type="range"
						min={limits.font.min}
						max={limits.font.max}
						bind:value={preferences.maxFontSize}
						class="range-input"
						class:error
					/>
				</div>
				<input
					type="text"
					value={preferences.maxFontSize}
					onchange={(e) =>
						handleInput(e, (v) => (preferences.maxFontSize = v), limits.font.min, limits.font.max)}
					class="input"
					class:error
				/>
			</div>
			{#if error}
				<p class="text-[10px] text-rose-500">Minimun font size bigger than maximum one</p>
			{/if}
		</div>
	</div>
</Block>
