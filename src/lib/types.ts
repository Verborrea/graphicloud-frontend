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

export interface Rect {
	x: number;
	y: number;
	w: number;
	h: number;
}