import type { GCloud, KeyWord, Result } from "./types";

interface ApiType {
	docs: File[]
	results: {
		global: KeyWord[]
		locals: Result[]
		similarity: number | null
		errors?: { filename: string; detail: string }[]
	} | null
	isLoading: boolean
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
	iconsCount: number
	sortByImportance: boolean
	generationMode: 'sequential' | 'parallel'
	clusterize: boolean
}

interface LassoType {
	active: boolean
	isDrawing: boolean
	lassoPoints: { x: number; y: number }[]
	words: { word: string; score: number; cloudId: string }[]
	svg: string | undefined
	isLoadingImage: boolean
	hoveredNode: { texts: string[], score: number, x: number, y: number } | null

}

interface PreferencesType {
	font: string
	minFontSize: number
	maxFontSize: number
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
	iconsCount: 0,
	sortByImportance: false,
	generationMode: 'parallel',
	clusterize: false
})

export const preferences = $state<PreferencesType>({
	font: 'Inter',
	minFontSize: 10,
	maxFontSize: 24,
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
	svg: undefined,
	hoveredNode: null as { texts: string[], score: number, x: number, y: number } | null
});