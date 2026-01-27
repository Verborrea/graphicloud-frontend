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