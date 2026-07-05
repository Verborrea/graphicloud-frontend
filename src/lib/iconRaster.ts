const bitmapCache = new Map<string, ImageBitmap>();
const pending = new Set<string>();

function colorizeSvg(svg: string, color: string): string {
	let out = svg.replaceAll('currentColor', color);

	const hasRealFill = /fill\s*=\s*["'](?!none)/i.test(out);
	const hasRealStroke = /stroke\s*=\s*["'](?!none)/i.test(out);

	out = out
		.replace(/fill\s*=\s*"(?!none")[^"]*"/gi, `fill="${color}"`)
		.replace(/fill\s*=\s*'(?!none')[^']*'/gi, `fill='${color}'`)
		.replace(/stroke\s*=\s*"(?!none")[^"]*"/gi, `stroke="${color}"`)
		.replace(/stroke\s*=\s*'(?!none')[^']*'/gi, `stroke='${color}'`);

	if (!hasRealFill && !hasRealStroke) {
		out = out.replace(/<svg\b/i, `<svg fill="${color}"`);
	}

	return out;
}

// Hash corto y estable del contenido del SVG (no del string completo: evita
// keys gigantes en el Map mientras sigue siendo único por contenido real).
function hashSvg(svg: string): string {
	let h = 0;
	for (let i = 0; i < svg.length; i++) {
		h = (h * 31 + svg.charCodeAt(i)) | 0;
	}
	return h.toString(36);
}

function rasterKey(svg: string, color: string, w: number, h: number): string {
	// w/h redondeados al entero: evita un bitmap distinto por cada decimal de
	// zoom continuo. El canvas reescala bitmaps sin pérdida visible perceptible
	// dentro de ese margen.
	return `${hashSvg(svg)}|${color}|${Math.round(w)}x${Math.round(h)}`;
}

/**
 * Devuelve el ImageBitmap cacheado para (svg, color, w, h), o null si aún no
 * está listo. Si no está, dispara la rasterización en background; cuando
 * termine, llama a onReady() para que el caller pueda forzar un repaint.
 */
export function getIconBitmap(
	svg: string,
	color: string,
	w: number,
	h: number,
	onReady: () => void
): ImageBitmap | null {
	const key = rasterKey(svg, color, w, h);

	const cached = bitmapCache.get(key);
	if (cached) return cached;

	if (!pending.has(key)) {
		pending.add(key);
		rasterize(svg, color, w, h)
			.then((bmp) => {
				bitmapCache.set(key, bmp);
				onReady();
			})
			.catch((err) => console.error('Error rasterizando ícono:', err))
			.finally(() => pending.delete(key));
	}

	return null;
}

async function rasterize(svg: string, color: string, w: number, h: number): Promise<ImageBitmap> {
	const colored = colorizeSvg(svg, color);
	const blob = new Blob([colored], { type: 'image/svg+xml' });
	const url = URL.createObjectURL(blob);

	try {
		const img = new Image();
		await new Promise<void>((resolve, reject) => {
			img.onload = () => resolve();
			img.onerror = reject;
			img.src = url;
		});

		const dpr = Math.min(window.devicePixelRatio || 1, 2) * 2;
		return await createImageBitmap(img, {
			resizeWidth: Math.max(1, Math.round(w * dpr)),
			resizeHeight: Math.max(1, Math.round(h * dpr)),
			resizeQuality: 'high'
		});
	} finally {
		URL.revokeObjectURL(url);
	}
}

export function clearIconBitmapCache() {
	for (const bmp of bitmapCache.values()) bmp.close();
	bitmapCache.clear();
	pending.clear();
}