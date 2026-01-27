<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import cloud from 'd3-cloud';

	interface CloudWord extends cloud.Word {
		text: string;
		size: number;
		x: number;
		y: number;
		rotate: number;
	}

	let { keywords, x, y } = $props();

	let words = $state<CloudWord[]>([]);

	const scores: number[] = keywords.map((k: any) => Number(k.score));

	const minScore = d3.min(scores) ?? 0;
	const maxScore = d3.max(scores) ?? 1;

	onMount(() => {
		const fontSizeScale = d3.scaleSqrt().domain([minScore, maxScore]).range([10, 36]);

		const layout = cloud()
			.size([200, 200]) // Mejorar, calcular automáticamente
			.words(keywords.map((d: any) => ({ text: d.word, size: fontSizeScale(d.score) })))
			.padding(2)
			.rotate(() => 0)
			.font('Inter, sans-serif')
			.fontSize((d: any) => d.size)
			.on('end', (computedWords) => {
				words = computedWords as CloudWord[];
			});

		layout.start();
	});
</script>

<g transform="translate({x}, {y})">
	{#each words as word}
		<text
			style="font-size: {word.size}px; font-weight: bold;"
			text-anchor="middle"
			class="pointer-events-none fill-slate-700 transition-all"
			transform="translate({word.x}, {word.y}) rotate({word.rotate})"
		>
			{word.text}
		</text>
	{/each}
</g>
