<script lang="ts">
	import * as d3 from 'd3';

	import type { KeyWord, Word, CloudWord } from '$lib/types';
	import { getRandomColor, myWordle } from '$lib/utils';

	let { keywords = [], min = 12, max = 48, showBoxes = false } = $props();

	let placedWords = $state<Word[]>([]);
	let measureGrp = $state<SVGGElement>();

	let scores = $derived(keywords.map((k) => k.score));
	let minScore = $derived(d3.min(scores) ?? 0);
	let maxScore = $derived(d3.max(scores) ?? 1);
	const color = getRandomColor();

	$effect(() => {
		if (keywords.length === 0 || !measureGrp) return;

		const fontSizeScale = d3
			.scaleSqrt()
			.domain([minScore, maxScore] as [number, number])
			.range([min, max]);

		const measuredData: CloudWord[] = keywords.map((kw: KeyWord) => {
			const size = fontSizeScale(kw.score);
			// Creamos elemento temporal para medir
			const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			t.style.fontSize = `${size}px`;
			t.style.fontWeight = '800';
			t.style.fontFamily = 'Inter, sans-serif';
			t.textContent = kw.word;

			measureGrp?.appendChild(t);
			const bbox = t.getBBox();
			measureGrp?.removeChild(t);

			return { ...kw, size, realW: bbox.width, realH: bbox.height };
		});

		// Tu función de layout
		placedWords = myWordle(measuredData);
	});
</script>

<g class="word-cloud-container">
	<g bind:this={measureGrp} style="visibility: hidden; pointer-events: none;"></g>

	{#each placedWords as word}
		<g transform="translate({word.x}, {word.y})">
			{#if showBoxes}
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
				style="font-size: {word.size}px;"
				text-anchor="middle"
				dominant-baseline="central"
				class="fill-slate-700 font-extrabold transition-all duration-500 select-none"
			>
				{word.text}
			</text>
		</g>
	{/each}
</g>

<style>
	text {
		font-family: 'Inter', sans-serif;
		paint-order: stroke;
	}
</style>
