import type { CloudWord, Result } from "./types";

export function convexHull(points: Result[]) {
	if (points.length <= 1) return points;

	// Ordenar por X, y en empate por Y
	const pts = [...points].sort((a, b) =>
		a.x === b.x ? a.y - b.y : a.x - b.x
	);

	// Producto cruzado
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

// export function myWordle(measuredKeywords: CloudWord[]) {
// 	const placedRects: any[] = [];
// 	const results: any[] = [];

// 	const sorted = [...measuredKeywords].sort((a, b) => b.score - a.score);

// 	for (const kw of sorted) {
// 		const w = kw.realW;
// 		const h = kw.realH * 0.7;

// 		let t = 0;
// 		const step = 0.5;
// 		let placed = false;

// 		while (!placed && t < 200) {
// 			const tx = Math.sin(t) * t * 1.2;
// 			const ty = Math.cos(t) * t * 1.2;

// 			const candidate = {
// 				x: tx - w / 2,
// 				y: ty - h / 2,
// 				w: w,
// 				h: h
// 			};

// 			const overlap = placedRects.some(r =>
// 				!(candidate.x > r.x + r.w ||
// 					candidate.x + candidate.w < r.x ||
// 					candidate.y > r.y + r.h ||
// 					candidate.y + candidate.h < r.y)
// 			);

// 			if (!overlap) {
// 				placedRects.push(candidate);
// 				results.push({
// 					text: kw.word,
// 					size: kw.size,
// 					x: tx,
// 					y: ty,
// 					width: candidate.w,
// 					height: candidate.h
// 				});
// 				placed = true;
// 			}
// 			t += step;
// 		}
// 	}
// 	return results;
// }

export function myWordle(measuredKeywords: CloudWord[], mode: 'mani' | 'rl' | 'rc') {
	const placedRects: any[] = [];
	const results: any[] = [];
	const sorted = [...measuredKeywords].sort((a, b) => b.score - a.score);

	for (const kw of sorted) {
		const w = kw.realW;
		const h = kw.realH * 0.7;

		let placed = false;
		let t = 0;
		const step = 0.5;

		while (!placed && t < 300) {
			let tx = 0;
			let ty = 0;

			if (mode === 'mani') {
				tx = (t * 1.2) * Math.cos(t);
				ty = (t * 1.2) * Math.sin(t);
			} else if (mode === 'rl') {
				tx = (t * 2.5) * Math.cos(t);
				ty = (t * 1.0) * Math.sin(t);
			} else if (mode === 'rc') {
				tx = Math.pow(t, 1.1) * Math.cos(t) * 1.5;
				ty = Math.pow(t, 1.1) * Math.sin(t) * 1.5;
			}

			const candidate = { x: tx - w / 2, y: ty - h / 2, w, h };

			const overlap = placedRects.some(r =>
				!(candidate.x > r.x + r.w || candidate.x + candidate.w < r.x ||
					candidate.y > r.y + r.h || candidate.y + candidate.h < r.y)
			);

			if (!overlap) {
				placedRects.push(candidate);
				results.push({
					text: kw.word,
					size: kw.size,
					x: tx,
					y: ty,
					width: candidate.w,
					height: candidate.h
				});
				placed = true;
			}
			t += step;
		}
	}
	return results;
}

export function getRandomColor() {
	const h = Math.floor(Math.random() * 360);
	const s = 100;
	const l = 30;

	return `hsl(${h}, ${s}%, ${l}%)`;
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