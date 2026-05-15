import type { GCNode, Result } from "./types";

export function convexHull(points: Result[]) {
	if (points.length <= 1) return points;

	const pts = [...points].sort((a, b) =>
		a.x === b.x ? a.y - b.y : a.x - b.x
	);

	function cross(o: Result, a: Result, b: Result) {
		return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
	}

	const lower = [];
	for (const p of pts) {
		while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
			lower.pop();
		}
		lower.push(p);
	}

	const upper = [];
	for (let i = pts.length - 1; i >= 0; i--) {
		const p = pts[i];
		while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
			upper.pop();
		}
		upper.push(p);
	}

	lower.pop();
	upper.pop();
	return lower.concat(upper);
}

export type LayoutNode = {
	id: string;
	texts: string[];
	score: number;
	fontSize: number;
	w: number;
	h: number;
	ascent: number;
	icon?: string;
};

export function myWordle(
	nodes: LayoutNode[],
	mode: 'mani' | 'rl' | 'rc',
	obstacles: { x: number; y: number; w: number; h: number }[] = []
): GCNode[] {
	const placedRects: { x: number; y: number; w: number; h: number }[] = [
		...obstacles
	];

	const results: GCNode[] = [];
	const sorted = [...nodes].sort((a, b) => b.score - a.score);

	for (const node of sorted) {
		const w = node.w;
		const h = node.h;
		const step = 0.1;

		let placed = false;
		let t = 0;

		while (!placed && t < 800) {
			let tx = 0;
			let ty = 0;

			if (mode === 'mani') {
				tx = t * 1.2 * Math.cos(t);
				ty = t * 1.2 * Math.sin(t);
			}
			else if (mode === 'rl') {
				tx = t * 2.5 * Math.cos(t);
				ty = t * 1.0 * Math.sin(t);
			}
			else if (mode === 'rc') {
				tx = Math.pow(t, 1.1) * Math.cos(t) * 1.5;
				ty = Math.pow(t, 1.1) * Math.sin(t) * 1.5;
			}

			const candidate = { x: tx - w / 2, y: ty - h / 2, w, h };

			const overlap = placedRects.some((r) =>
				!(
					candidate.x > r.x + r.w ||
					candidate.x + candidate.w < r.x ||
					candidate.y > r.y + r.h ||
					candidate.y + candidate.h < r.y
				)
			);

			if (!overlap) {
				placedRects.push(candidate);
				results.push({
					...node,
					x: tx,
					y: ty
				});
				placed = true;
			}

			t += step;
		}
	}

	return results;
}

export function handleNumericInput(e: Event, callback: (val: number) => void) {
	const target = e.target as HTMLInputElement;
	const cleanValue = target.value.replace(/\D/g, '');
	const numValue = cleanValue === '' ? 0 : Number(cleanValue);

	callback(numValue);

	target.value = cleanValue;
}

export function validateRange(
	value: number,
	min: number,
	max: number,
	callback: (val: number) => void) {
	if (value < min) {
		callback(min);
	} else if (value > max) {
		callback(max);
	} else {
		callback(value);
	}
}

export function getProgress(val: number, min: number, max: number) {
	const clamped = Math.min(Math.max(val, min), max);
	return ((clamped - min) / (max - min)) * 100;
};

export const WORD_CLOUD_PALETTE = [
	'#E63946',
	'#2196F3',
	'#FF6B35',
	'#7B2D8B',
	'#00897B',
	'#F4C430',
	'#E91E8C',
	'#1B5E20',
	'#0077B6',
	'#BF360C',
	'#4527A0',
	'#00838F',
];

let paletteIndex = 0;

export function getNextCloudColor(): string {
	const color = WORD_CLOUD_PALETTE[paletteIndex % WORD_CLOUD_PALETTE.length];
	paletteIndex++;
	return color;
}

export function pointInPolygon(
	point: { x: number; y: number },
	polygon: { x: number; y: number }[]
): boolean {
	let inside = false;
	const { x, y } = point;
	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const xi = polygon[i].x, yi = polygon[i].y;
		const xj = polygon[j].x, yj = polygon[j].y;
		const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
		if (intersect) inside = !inside;
	}
	return inside;
}

export function cloudBounds(nodes: GCNode[]): { x: number; y: number; w: number; h: number } {
	if (nodes.length === 0) return { x: 0, y: 0, w: 0, h: 0 };
	const xs = nodes.map((n) => n.x - n.w / 2);
	const ys = nodes.map((n) => n.y - n.h / 2);
	const xe = nodes.map((n) => n.x + n.w / 2);
	const ye = nodes.map((n) => n.y + n.h / 2);
	return {
		x: Math.min(...xs),
		y: Math.min(...ys),
		w: Math.max(...xe) - Math.min(...xs),
		h: Math.max(...ye) - Math.min(...ys)
	};
}