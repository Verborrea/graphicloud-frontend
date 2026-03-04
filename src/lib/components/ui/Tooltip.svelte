<script>
	let { tooltip } = $props();
</script>

<div
	class="tooltip pointer-events-none fixed z-50 flex max-w-md flex-col gap-2 rounded-xl bg-slate-900 p-4 text-sm text-white shadow-xl"
	style="left: {tooltip.x + 15}px; top: {tooltip.y - 15}px;"
>
	<div class="font-bold">{tooltip.text}</div>
	<div class="font-mono opacity-60">
		x:{tooltip.coords[0].toFixed(3)}&nbsp;&nbsp;&nbsp;y:{tooltip.coords[1].toFixed(3)}
	</div>
</div>
