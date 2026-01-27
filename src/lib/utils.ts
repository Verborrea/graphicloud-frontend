import type { Result } from "./types";

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