export const limits = {
	range: { min: 500, max: 4000 },
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
		value: 'Anton',
		text: 'Anton'
	}
];

export const algorithms = [
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