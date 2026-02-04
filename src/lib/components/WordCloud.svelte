<script lang="ts">
	import { myWordle } from '$lib/utils';
	import * as d3 from 'd3';

	let { keywords, x, y } = $props();

	let placedWords = $state<{ text: string; size: number; x: number; y: number }[]>([]);

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
		/* Evita parpadeos bruscos en el re-layout */
		transition:
			transform 0.5s ease-out,
			font-size 0.3s ease;
	}
</style>
