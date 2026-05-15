import type { GCloud, KeyWord, Result } from "./types";

interface ApiType {
	docs: File[]
	results: {
		global: KeyWord[],
		locals: Result[],
		similarity: number | null
	} | null;
	isLoading: boolean;
}

interface ModeType {
	mode: 'global' | 'local'
}

interface LayersType {
	docs: boolean
	hull: boolean
	wc: boolean
	bb: boolean
}

interface SettingsType {
	algorithm: 'mani' | 'rl' | 'rc'
	keywordsCount: number
}

interface LassoType {
	active: boolean,
	isDrawing: boolean,
	lassoPoints: { x: number; y: number }[],
	words: { word: string; score: number; cloudId: string }[],
	svg: string | undefined,
	isLoadingImage: boolean,
}

interface PreferencesType {
	font: string,
	minFontSize: number,
	maxFontSize: number,
	theme: number
}

interface GcloudsType {
	global: GCloud | null
	locals: GCloud[]
}

// States

export const api = $state<ApiType>({
	docs: [],
	results: null,
	isLoading: false
})

export const mode = $state<ModeType>({
	mode: 'global'
})

export const layers = $state<LayersType>({
	docs: true,
	hull: true,
	wc: true,
	bb: true,
})

export const settings = $state<SettingsType>({
	algorithm: 'mani',
	keywordsCount: 10,
})

export const preferences = $state<PreferencesType>({
	font: 'Inter',
	minFontSize: 12,
	maxFontSize: 36,
	theme: 0
})

export const gclouds = $state<GcloudsType>({
	global: null,
	locals: []
});

export const lasso = $state<LassoType>({
	active: false,
	isDrawing: false,
	lassoPoints: [] as { x: number; y: number }[],
	words: [] as { word: string; score: number; cloudId: string }[],
	isLoadingImage: false,
	svg: undefined
});