export interface CloudStateType {
	files: File[];
	results: { global: any[], locals: any[] } | null;
	isLoading: boolean;
	global: boolean;
	layers: {
		docs: boolean;
		hull: boolean;
		wc: boolean;
		bb: boolean;
	};
	font: string;
	algorithm: 'mani' | 'rl' | 'rc';
	keywordsCount: number;
	minFontSize: number;
	maxFontSize: number;
	range: number;
	theme: number;
}

export interface LassoStateType {
	active: boolean,
	isDrawing: boolean,
	lassoPoints: { x: number; y: number }[],
	words: { word: string; score: number; cloudId: string }[],
	svg: string | null,
	isLoadingImage: boolean,
	placedWordsMap: Record<string, { text: string; score: number; x: number; y: number }[]>,
}

export interface WordNode {
	id: number;
	x: number;
	y: number;
	text: string;
	fontSize: number;
	width: number;
	height: number;
	ascent: number;
};


// Old stuff

// export interface KeyWord {
// 	word: string
// 	score: number
// }

// export interface CloudWord extends KeyWord {
// 	size: number
// 	realW: number
// 	realH: number
// }

// export interface Result {
// 	filename: string
// 	x: number
// 	y: number
// 	keywords: KeyWord[]
// }

// export interface Rect {
// 	x: number;
// 	y: number;
// 	w: number;
// 	h: number;
// }

// export interface Word {
// 	text: string;
// 	size: number;
// 	score: number;
// 	x: number;
// 	y: number;
// 	width: number;
// 	height: number;
// }