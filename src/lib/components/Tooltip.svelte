<script>
	let { tooltip } = $props();
</script>

<div
	class="tooltip pointer-events-none fixed z-50 rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white shadow-xl"
	style="left: {tooltip.x + 15}px; top: {tooltip.y - 15}px;"
>
	<div class="font-bold">{tooltip.text}</div>
	<div class="text-[10px] opacity-60">
		x: {tooltip.coords[0].toFixed(3)} y: {tooltip.coords[1].toFixed(3)}
	</div>
</div>
