export interface KeyWord {
	word: string
	score: number
}

export interface WCNode extends KeyWord {
	width: number;
	fontSize: number;
	x: number;
	y: number;
	ascent: number;
	descent: number;
	text?: string;
	svg?: string;
	rectX?: number;
	rectY?: number;
	replacedWords?: string[]; // temporal
}

export interface Result {
	filename: string
	x: number
	y: number
	keywords: KeyWord[]
}

export interface ConfigStateType {
	files: File[];
	results: { global: KeyWord[], locals: Result[] } | null;
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

interface Cloud {
	id: string;
	nodes: WCNode[];
	color: string;
	ox: number;
	oy: number;
}

export interface CloudStateType {
	global: Cloud | null;
	locals: Cloud[];
}

export interface LassoStateType {
	active: boolean,
	isDrawing: boolean,
	lassoPoints: { x: number; y: number }[],
	words: { word: string; score: number; cloudId: string }[],
	svg: string | null,
	isLoadingImage: boolean,
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
	descent: number;
};

