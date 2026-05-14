export interface KeyWord {
	word: string
	score: number
}

export interface Result {
	filename: string
	x: number
	y: number
	keywords: KeyWord[]
}

export interface GCNode {
	id: string
	texts: string[]

	x: number
	y: number
	w: number
	h: number

	score: number
	fontSize: number

	icon?: string
}

export interface GCloud {
	id: string;
	nodes: GCNode[];
	color: string;
	offsetX: number;
	offsetY: number;
}
