export const mockData = {
	global: [
		{ word: "dog", score: 0.8 },
		{ word: "cat", score: 0.4 },
		{ word: "bear", score: 0.35 },
		{ word: "wolf", score: 0.7 },
		{ word: "fish", score: 0.1 },
	],
	locals: [
		{
			filename: 'doc1.pdf',
			x: 0,
			y: 0.5,
			keywords: [
				{ word: "dog", score: 0.5 },
				{ word: "cat", score: 0.4 },
			]
		},
		{
			filename: 'doc2.pdf',
			x: 0.5,
			y: 1,
			keywords: [
				{ word: "dog", score: 0.4 },
				{ word: "wolf", score: 0.2 },
			]
		},
		{
			filename: 'doc3.pdf',
			x: 1,
			y: 0,
			keywords: [
				{ word: "bear", score: 0.7 },
				{ word: "wolf", score: 0.6 },
				{ word: "fish", score: 0.2 },
			]
		}
	]
}