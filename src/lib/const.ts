export const limits = {
	keywords: { min: 3, max: 30 },
	font: { min: 10, max: 72 },
	zoom: { min: 0.1, max: 5 }
};

export const zoomSpeed = 0.001;

export const fonts = [
	{
		value: 'Inter',
		text: 'Inter'
	},
	{
		value: 'Poppins',
		text: 'Poppins'
	},
	{
		value: 'Impact',
		text: 'Impact'
	}
];

export const algorithms = [
	{
		value: 'classic',
		text: 'Classic Wordle'
	},
	{
		value: 'mani',
		text: 'ManiWordle'
	},
	{
		value: 'rl',
		text: 'RWordle-L'
	},
	{
		value: 'rc',
		text: 'RWordle-C'
	}
];