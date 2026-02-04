<script lang="ts">
	import type { Word } from '$lib/types';
	import { myWordle } from '$lib/utils';
	import * as d3 from 'd3';

	let { keywords, x, y, showBoxes } = $props();

	let placedWords = $state<Word[]>([]);

	let scores = $derived(keywords.map((k: any) => k.score));
	let minScore = $derived(d3.min(scores) ?? 0);
	let maxScore = $derived(d3.max(scores) ?? 1);

	$effect(() => {
		if (keywords.length === 0) return;

		const fontSizeScale = d3
			.scaleSqrt()
			.domain([minScore, maxScore] as [number, number])
			.range([10, 32]);

		placedWords = myWordle(keywords, fontSizeScale);
	});
</script>

<g transform="translate({x}, {y})">
	{#each placedWords as word}
		{#if showBoxes}
			<rect
				x={word.x - word.width / 2}
				y={word.y - word.height / 2}
				width={word.width}
				height={word.height}
				fill="none"
				stroke="#3b82f6"
				stroke-width="1"
				opacity="1"
			/>
		{/if}
		<text
			style="font-size: {word.size}px; font-weight: 800;"
			text-anchor="middle"
			alignment-baseline="middle"
			class="pointer-events-none fill-slate-700 transition-all duration-500 ease-out"
			transform="translate({word.x}, {word.y})"
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
	}
</style>
