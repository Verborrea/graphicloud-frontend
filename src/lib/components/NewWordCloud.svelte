<script lang="ts">
	import * as d3 from 'd3';

	import type { KeyWord, Word, CloudWord } from '$lib/types';
	import { getRandomColor, myWordle } from '$lib/utils';
	import { cloudState } from '$lib/state.svelte';

	let { keywords = [] } = $props();

	const topNKeywords = $derived(keywords.slice(0, cloudState.keywordsCount));

	let placedWords = $state<Word[]>([]);
	let measureGrp = $state<SVGGElement>();

	let scores = $derived(topNKeywords.map((k) => k.score));
	let minScore = $derived(d3.min(scores) ?? 0);
	let maxScore = $derived(d3.max(scores) ?? 1);
	const color = getRandomColor();

	$effect(() => {
		if (topNKeywords.length === 0 || !measureGrp) return;

		const fontSizeScale = d3
			.scaleSqrt()
			.domain([minScore, maxScore] as [number, number])
			.range([cloudState.minFontSize, cloudState.maxFontSize]);

		const measuredData: CloudWord[] = topNKeywords.map((kw: KeyWord) => {
			const size = fontSizeScale(kw.score);

			const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			t.style.fontSize = `${size}px`;
			// t.style.fontWeight = '800';
			t.style.fontFamily = cloudState.font;
			t.textContent = kw.word;

			measureGrp?.appendChild(t);
			const bbox = t.getBBox();
			measureGrp?.removeChild(t);

			return { ...kw, size: fontSizeScale(kw.score), realW: bbox.width, realH: bbox.height };
		});

		placedWords = myWordle(measuredData, cloudState.algorithm);
	});
</script>

<g class="word-cloud-container">
	<g bind:this={measureGrp} style="visibility: hidden; pointer-events: none;"></g>

	{#each placedWords as word}
		<g transform="translate({word.x}, {word.y})">
			{#if cloudState.layers.bb}
				<rect
					x={-word.width / 2}
					y={-word.height / 2}
					width={word.width}
					height={word.height}
					fill="none"
					stroke={color}
					opacity="0.3"
				/>
			{/if}
			<text
				style="font-size: {word.size}px; font-family: {cloudState.font}; paint-order: stroke;"
				text-anchor="middle"
				dominant-baseline="central"
				class="fill-slate-700 font-extrabold select-none"
			>
				{word.text}
			</text>
		</g>
	{/each}
</g>
