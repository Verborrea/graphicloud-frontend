import type { Rect, Result } from "./types";

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

function intersects(r1: Rect, r2: Rect): boolean {
	return !(r2.x > r1.x + r1.w ||
		r2.x + r2.w < r1.x ||
		r2.y > r1.y + r1.h ||
		r2.y + r2.h < r1.y);
}

export function myWordle(keywords: any[], fontSizeScale: d3.ScalePower<number, number>) {
	const placedRects: Rect[] = [];
	const results = [];

	const sorted = [...keywords].sort((a, b) => b.score - a.score);

	for (const kw of sorted) {
		const fontSize = fontSizeScale(kw.score);

		// Estimación del ancho del texto (mejorar)
		const w = kw.word.length * (fontSize * 0.55);
		const h = fontSize;

		let t = 0;
		const step = 0.5; // Paso de la espiral
		let placed = false;

		while (!placed && t < 100) { // Límite de seguridad
			const tx = Math.sin(t) * t * 2;
			const ty = Math.cos(t) * t * 2;

			const candidate: Rect = {
				x: tx - w / 2,
				y: ty - h / 2,
				w: w,
				h: h
			};

			const overlap = placedRects.some(r => intersects(r, candidate));

			if (!overlap) {
				placedRects.push(candidate);
				results.push({
					text: kw.word,
					size: fontSize,
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