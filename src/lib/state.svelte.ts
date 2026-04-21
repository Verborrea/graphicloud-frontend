import type { ConfigStateType, CloudStateType, LassoStateType } from "./types";

export const configState = $state<ConfigStateType>({
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

export const cloudState = $state<CloudStateType>({
	global: null,
	locals: []
});

export const lassoState = $state<LassoStateType>({
	active: false,
	isDrawing: false,
	lassoPoints: [] as { x: number; y: number }[],
	words: [] as { word: string; score: number; cloudId: string }[],
	svg: null as string | null,
	isLoadingImage: false,
})