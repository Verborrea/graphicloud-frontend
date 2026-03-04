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
	font: 'Inter',
	algorithm: 'classic',
	keywordsCount: 20,
	minFontSize: 16,
	maxFontSize: 48,
	theme: 0
});