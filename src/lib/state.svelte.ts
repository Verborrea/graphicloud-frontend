import type { CloudStateType, LassoStateType } from "./types";

export const cloudState = $state<CloudStateType>({
	files: [],
	results: null,
	isLoading: false,
	global: false,
	layers: {
		docs: true,
		hull: true,
		wc: true,
		bb: true,
	},
	font: 'Inter',
	algorithm: 'mani',
	keywordsCount: 10,
	minFontSize: 12,
	maxFontSize: 36,
	range: 1000,
	theme: 0
});

export const lassoState = $state<LassoStateType>({
	active: false,
	isDrawing: false,
	lassoPoints: [] as { x: number; y: number }[],
	words: [] as { word: string; score: number; cloudId: string }[],
	svg: null as string | null,
	isLoadingImage: false,
	placedWordsMap: {} as Record<string, { text: string; score: number; x: number; y: number }[]>,
})

// words: [
// 	{
// 		word: 'cat',
// 		score: 0.8,
// 		cloudId: '9sahdSfg'
// 	},
// 	{
// 		word: 'dog',
// 		score: 0.7,
// 		cloudId: '0asglk3g'
// 	},
// 	{
// 		word: 'bone',
// 		score: 0.2,
// 		cloudId: 'sadpogn3'
// 	}
// ] as { word: string; score: number; cloudId: string }[],