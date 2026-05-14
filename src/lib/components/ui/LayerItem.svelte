<script>
	let { label, checked = $bindable(false) } = $props();

	const id = Math.random().toString(36).substring(2, 9);
</script>

<label
	class="group -mx-1.5 flex cursor-pointer items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-slate-200"
>
	<div class="relative flex items-center">
		<input
			{id}
			type="checkbox"
			bind:checked
			class="peer size-5 cursor-pointer appearance-none rounded-md border border-border bg-slate-50 transition-all checked:border-primary checked:bg-primary"
		/>
		<svg
			class="pointer-events-none absolute left-0.75 size-3.5 text-slate-50 opacity-0 transition-opacity peer-checked:opacity-100"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="4"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
		</svg>
	</div>

	<span class="text-sm font-medium select-none">
		{label}
	</span>
</label>
