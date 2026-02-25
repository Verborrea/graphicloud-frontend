<script lang="ts">
	import type { CloudWord, KeyWord, Word } from '$lib/types';
	import { getRandomColor, myWordle } from '$lib/utils';
	import * as d3 from 'd3';

	let { keywords, x, y, showBoxes, min, max } = $props();

	let placedWords = $state<Word[]>([]);
	let measureGrp = $state<SVGGElement>();

	let scores = $derived(keywords.map((k: any) => k.score));
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

			const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			t.style.fontSize = `${size}px`;
			t.style.fontWeight = '800';
			t.style.fontFamily = 'Inter, sans-serif';
			t.textContent = kw.word;

			measureGrp?.appendChild(t);
			const bbox = t.getBBox();
			measureGrp?.removeChild(t);

			return {
				...kw,
				size,
				realW: bbox.width,
				realH: bbox.height
			};
		});

		placedWords = myWordle(measuredData);
	});
</script>

<g transform="translate({x}, {y})">
	<g bind:this={measureGrp} style="visibility: hidden; pointer-events: none;"></g>

	{#each placedWords as word}
		{#if showBoxes}
			<rect
				x={word.x - word.width / 2}
				y={word.y - word.height / 2}
				width={word.width}
				height={word.height}
				fill="none"
				stroke={color}
				stroke-width="1"
			/>
		{/if}
		<text
			style="font-size: {word.size}px; font-weight: 800;"
			text-anchor="middle"
			dominant-baseline="central"
			class="pointer-events-none fill-slate-700 transition-all duration-500 ease-out"
			transform="translate({word.x}, {word.y - word.size * 0.2})"
		>
			{word.text}
		</text>
	{/each}
</g>

<style>
	text {
		transition:
			transform 0.5s ease-out,
			font-size 0.3s ease;
		font-family: 'Inter', sans-serif;
	}
</style>
