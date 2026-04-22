<script lang="ts">
	import { configState, cloudState, lassoState } from '$lib/state.svelte';
	import { convexHull, myWordle, WORD_CLOUD_PALETTE } from '$lib/utils';
	import { measureWord } from '$lib/measureWord';
	import WordCloud from './WordCloud.svelte';
	import * as d3 from 'd3';
	import type { KeyWord, WCNode } from '$lib/types';

	const xScale = $derived(d3.scaleLinear().domain([0, 1]).range([0, configState.range]));
	const yScale = $derived(d3.scaleLinear().domain([0, 1]).range([configState.range, 0]));

	const locals = $derived(configState.results?.locals ?? []);
	const hullPoints = $derived(locals.length >= 3 ? convexHull(locals) : []);

	const lineGenerator = $derived(
		d3
			.line<any>()
			.x((d) => xScale(d.x))
			.y((d) => yScale(d.y))
			.curve(d3.curveLinearClosed)
	);

	async function measureAndPlace(
		words: any[],
		font: string,
		minFontSize: number,
		maxFontSize: number,
		algorithm: string
	) {
		const scores = words.map((w) => w.score);
		const minS = Math.min(...scores);
		const maxS = Math.max(...scores);

		const measured = await Promise.all(
			words.map(async (kw) => {
				const fontSize =
					minFontSize + ((kw.score - minS) / (maxS - minS || 1)) * (maxFontSize - minFontSize);

				if (kw.svg) {
					return { ...kw, fontSize, width: fontSize, ascent: fontSize, descent: 0 };
				}

				const dims = await measureWord(kw.word, fontSize, font);
				return { ...kw, ...dims, fontSize, text: kw.word };
			})
		);

		return myWordle(measured, algorithm as any);
	}

	let iconMemory: Record<string, WCNode[]> = {};

	// Efecto principal — solo para configuración
	$effect(() => {
		const results = configState.results;
		if (!results) return;

		const algorithm = configState.algorithm;
		const keywordsCount = configState.keywordsCount;
		const minFontSize = configState.minFontSize;
		const maxFontSize = configState.maxFontSize;
		const font = configState.font;
		const isGlobal = configState.global;
		const range = configState.range;

		iconMemory = {}; // reset memoria cuando cambia config

		processAll(
			results,
			{ algorithm, keywordsCount, minFontSize, maxFontSize, font, isGlobal, range },
			new Map()
		);
	});

	// Efecto separado — solo para íconos
	$effect(() => {
		const results = configState.results;
		if (!results) return;
		const newSvg = lassoState.svg;
		if (!newSvg) return;

		// Capturar words ANTES de que clearSelection las borre
		const selectedWords = [...lassoState.words];
		if (selectedWords.length === 0) return;

		const algorithm = configState.algorithm;
		const keywordsCount = configState.keywordsCount;
		const minFontSize = configState.minFontSize;
		const maxFontSize = configState.maxFontSize;
		const font = configState.font;
		const isGlobal = configState.global;
		const range = configState.range;

		const pendingByCloud = new Map<string, { words: string[]; score: number }>();
		for (const w of selectedWords) {
			if (!pendingByCloud.has(w.cloudId)) pendingByCloud.set(w.cloudId, { words: [], score: 0 });
			const entry = pendingByCloud.get(w.cloudId)!;
			entry.words.push(w.word);
			entry.score += w.score;
		}

		processAll(
			results,
			{ algorithm, keywordsCount, minFontSize, maxFontSize, font, isGlobal, range },
			pendingByCloud
		);
	});

	async function processAll(
		results: any,
		cfg: {
			algorithm: string;
			keywordsCount: number;
			minFontSize: number;
			maxFontSize: number;
			font: string;
			isGlobal: boolean;
			range: number;
		},
		pendingByCloud: Map<string, { words: string[]; score: number }>
	) {
		const { algorithm, keywordsCount, minFontSize, maxFontSize, font, isGlobal, range } = cfg;

		if (isGlobal) {
			const nodes = await prepareCloud(
				results.global,
				'global',
				keywordsCount,
				pendingByCloud,
				font,
				minFontSize,
				maxFontSize,
				algorithm
			);
			iconMemory['global'] = nodes.filter((n: any) => !!n.svg);
			cloudState.global = {
				id: 'global',
				nodes,
				color: WORD_CLOUD_PALETTE[0],
				ox: range / 2,
				oy: range / 2
			};
		} else {
			const processedLocals = await Promise.all(
				results.locals.map(async (doc: any, index: number) => {
					const id = doc.filename;
					const nodes = await prepareCloud(
						doc.keywords,
						id,
						keywordsCount,
						pendingByCloud,
						font,
						minFontSize,
						maxFontSize,
						algorithm
					);
					iconMemory[id] = nodes.filter((n: any) => !!n.svg);
					const color = WORD_CLOUD_PALETTE[index % WORD_CLOUD_PALETTE.length];
					return { id, nodes, color, ox: xScale(doc.x), oy: yScale(doc.y) };
				})
			);
			cloudState.locals = processedLocals;
		}
	}

	async function prepareCloud(
		keywords: KeyWord[],
		cloudId: string,
		keywordsCount: number,
		pendingByCloud: Map<string, { words: string[]; score: number }>,
		font: string,
		minFontSize: number,
		maxFontSize: number,
		algorithm: string
	) {
		const existingIcons: WCNode[] = iconMemory[cloudId] ?? [];
		const alreadyExcluded = existingIcons.flatMap((n) => n.replacedWords ?? []);
		const pending = pendingByCloud.get(cloudId);
		const allExcluded = [...alreadyExcluded, ...(pending?.words ?? [])];

		const availableKeywords = keywords.filter((kw) => !allExcluded.includes(kw.word));
		const iconsCount = existingIcons.length + (pending ? 1 : 0);
		const keywordSlots = Math.max(0, keywordsCount - iconsCount);

		if (availableKeywords.length > keywordsCount) {
			iconMemory[cloudId] = [];
			return await measureAndPlace(
				keywords.slice(0, keywordsCount),
				font,
				minFontSize,
				maxFontSize,
				algorithm
			);
		}

		let words: any[] = availableKeywords.slice(0, keywordSlots);
		for (const icon of existingIcons) words.push(icon);
		if (pending)
			words.push({ score: pending.score, svg: lassoState.svg, replacedWords: pending.words });

		if (words.length === 0) return [];
		return await measureAndPlace(words, font, minFontSize, maxFontSize, algorithm);
	}
</script>

{#if configState.global}
	<g transform="translate({configState.range / 2}, {configState.range / 2})">
		<WordCloud cloudId="global" isGlobal={true} />
	</g>
{:else}
	{#if configState.layers.hull && hullPoints.length > 0}
		<path
			d={lineGenerator(hullPoints)}
			class="pointer-events-none fill-blue-400/10 stroke-blue-500/30 stroke-[4px]"
			style="stroke-dasharray: 10,10"
		/>
	{/if}

	{#each locals as doc}
		<g transform="translate({xScale(doc.x)}, {yScale(doc.y)})">
			<WordCloud cloudId={doc.filename} />
		</g>
	{/each}

	{#if configState.layers.docs}
		{#each locals as doc}
			<circle cx={xScale(doc.x)} cy={yScale(doc.y)} r="8" class="fill-blue-600" />
		{/each}
	{/if}
{/if}
