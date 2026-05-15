let _canvas: HTMLCanvasElement | null = null;
let _ctx: CanvasRenderingContext2D | null = null;

function getCtx(): CanvasRenderingContext2D {
	if (!_ctx) {
		_canvas = document.createElement('canvas');
		_ctx = _canvas.getContext('2d')!;
	}
	return _ctx;
}

// export async function measureWord(
// 	text: string,
// 	fontSize: number,
// 	fontFamily: string
// ): Promise<{ width: number; ascent: number; descent: number }> {
// 	await document.fonts.load(`${fontSize}px ${fontFamily}`);
// 	const ctx = getCtx();
// 	ctx.font = `${fontSize}px ${fontFamily}`;
// 	const m = ctx.measureText(text);
// 	return {
// 		width: m.width,
// 		ascent: m.actualBoundingBoxAscent,
// 		descent: m.actualBoundingBoxDescent,
// 	};
// }

export async function measureWord(
	text: string,
	fontSize: number,
	fontFamily: string
) {
	await document.fonts.load(`${fontSize}px ${fontFamily}`);
	const ctx = getCtx();
	ctx.font = `${fontSize}px ${fontFamily}`;
	const m = ctx.measureText(text);

	const ascent = m.actualBoundingBoxAscent;
	const descent = m.actualBoundingBoxDescent;

	return {
		w: m.width,
		h: ascent + descent,
		ascent
	};
}