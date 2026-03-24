import type { CloudStateType } from "./types";

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
	font: 'Anton',
	algorithm: 'mani',
	keywordsCount: 10,
	minFontSize: 12,
	maxFontSize: 36,
	range: 1000,
	theme: 0
});

export const selectState = $state({
	active: false,
	isDrawing: false,
	lassoPoints: [] as { x: number; y: number }[],
	words: [] as { text: string; score: number; cloudId: string }[],
	svgOverlay: null as string | null,
	isLoadingImage: false,
})