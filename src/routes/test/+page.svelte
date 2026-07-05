<script lang="ts">
	import '../app.css';

	import { onMount } from 'svelte';

	interface DocumentData {
		filename: string;
		x: number;
		y: number;
		cluster?: number | null;
	}

	interface ProjectionMeta {
		cluster_on: string;
		reducer: string;
	}

	interface ProjectionResponse {
		locals: DocumentData[];
		meta: ProjectionMeta;
	}

	let apiUrl = $state<string>('http://localhost:8000/project-pdfs/');
	let files = $state<FileList | undefined>();

	let clusterOn = $state('raw_embeddings');
	let normalizeMode = $state('uniform');
	let umapNNeighbors = $state(15);
	let umapMinDist = $state(0.15);
	let hdbscanMinClusterSize = $state(2);
	let hdbscanMinSamples = $state(1);
	let sampleFraction = $state('auto');

	let loading = $state(false);
	let error = $state<string | null>(null);
	let result = $state<ProjectionResponse | null>(null);

	let hovered = $state<DocumentData | null>(null);
	let showLabels = $state(false);
	let hoveredPosition = $state({ x: 0, y: 0 });

	const SVG_WIDTH = 750;
	const SVG_HEIGHT = 750;

	// Paleta de colores más vivos y dinámicos (tonos neón y de alta saturación)
	const CLUSTER_COLORS = [
		'#FF1493', // DeepPink
		'#00FFFF', // Cyan
		'#39FF14', // Neon Green
		'#FF4500', // OrangeRed
		'#9D00FF', // Neon Purple
		'#FFD700', // Gold
		'#1E90FF', // DodgerBlue
		'#FF00FF', // Magenta
		'#00FF00', // Lime
		'#FF8C00', // DarkOrange
		'#00FA9A', // MediumSpringGreen
		'#DC143C', // Crimson
		'#8A2BE2', // BlueViolet
		'#FF69B4', // HotPink
		'#00BFFF', // DeepSkyBlue
		'#7CFC00', // LawnGreen
		'#FF003F', // Electric Crimson
		'#00E5FF', // Cyan Accent
		'#FFFF00', // Yellow
		'#FF3366' // Radical Red
	];

	function colorForCluster(c: number | null | undefined) {
		if (c === null || c === undefined || c === -1) {
			return '#9ca3af';
		}

		return CLUSTER_COLORS[c % CLUSTER_COLORS.length];
	}

	async function runProjection() {
		if (!files || files.length === 0) {
			error = 'Selecciona al menos un PDF.';
			return;
		}

		error = null;
		loading = true;
		result = null;
		hovered = null;

		try {
			const form = new FormData();

			for (let i = 0; i < files.length; i++) {
				form.append('files', files[i]);
			}

			form.append('cluster_on', clusterOn);
			form.append('normalize_mode', normalizeMode);
			form.append('umap_n_neighbors', String(umapNNeighbors));
			form.append('umap_min_dist', String(umapMinDist));
			form.append('hdbscan_min_cluster_size', String(hdbscanMinClusterSize));
			form.append('hdbscan_min_samples', String(hdbscanMinSamples));
			form.append('sample_fraction', sampleFraction);

			const res = await fetch(apiUrl, {
				method: 'POST',
				body: form
			});

			if (!res.ok) {
				throw new Error(await res.text());
			}

			result = await res.json();
			console.log(result);
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			loading = false;
		}
	}

	function pointPosition(doc: DocumentData, w: number, h: number, pad: number) {
		return {
			x: pad + doc.x * (w - pad * 2),
			y: pad + (1 - doc.y) * (h - pad * 2)
		};
	}

	onMount(() => {});
</script>

<div class="fixed inset-0 flex flex-1 overflow-hidden bg-gray-50 text-gray-900">
	<aside class="w-80 shrink-0 space-y-4 overflow-y-auto border-r border-gray-200 bg-white p-4">
		<div class="space-y-2">
			<label class="block text-xs font-semibold text-gray-700">Archivos PDF</label>
			<input type="file" multiple accept="application/pdf" bind:files class="w-full text-sm" />
		</div>

		<hr class="border-gray-200" />

		<div class="space-y-3">
			<div class="space-y-1">
				<label class="block text-xs font-semibold text-gray-700">Cluster On</label>
				<input
					type="text"
					bind:value={clusterOn}
					class="w-full rounded border border-gray-300 p-2 text-sm"
					placeholder="Ej: raw_embeddings"
				/>
			</div>

			<div class="space-y-1">
				<label class="block text-xs font-semibold text-gray-700">Normalize Mode</label>
				<select
					bind:value={normalizeMode}
					class="w-full rounded border border-gray-300 p-2 text-sm"
				>
					<option value="uniform">uniform</option>
					<option value="none">none</option>
				</select>
			</div>

			<div class="grid grid-cols-2 gap-2">
				<div class="space-y-1">
					<label class="block text-xs font-semibold text-gray-700">UMAP N-Neighbors</label>
					<input
						type="number"
						bind:value={umapNNeighbors}
						class="w-full rounded border border-gray-300 p-2 text-sm"
					/>
				</div>
				<div class="space-y-1">
					<label class="block text-xs font-semibold text-gray-700">UMAP Min Dist</label>
					<input
						type="number"
						step="0.01"
						bind:value={umapMinDist}
						class="w-full rounded border border-gray-300 p-2 text-sm"
					/>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-2">
				<div class="space-y-1">
					<label class="block text-xs font-semibold text-gray-700">HDBSCAN Min Size</label>
					<input
						type="number"
						bind:value={hdbscanMinClusterSize}
						class="w-full rounded border border-gray-300 p-2 text-sm"
					/>
				</div>
				<div class="space-y-1">
					<label class="block text-xs font-semibold text-gray-700">HDBSCAN Min Samples</label>
					<input
						type="number"
						bind:value={hdbscanMinSamples}
						class="w-full rounded border border-gray-300 p-2 text-sm"
					/>
				</div>
			</div>

			<div class="space-y-1">
				<label class="block text-xs font-semibold text-gray-700">Sample Fraction</label>
				<input
					type="text"
					bind:value={sampleFraction}
					class="w-full rounded border border-gray-300 p-2 text-sm"
					placeholder="auto o 0.5..."
				/>
			</div>
		</div>

		<hr class="border-gray-200" />

		<div class="flex items-center gap-2">
			<input id="labels" type="checkbox" bind:checked={showLabels} class="h-4 w-4" />

			<label for="labels" class="text-sm text-gray-700"> Mostrar nombres en puntos </label>
		</div>

		<button
			onclick={runProjection}
			disabled={loading}
			class="w-full rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
		>
			{loading ? 'Procesando...' : 'Ejecutar'}
		</button>

		{#if error}
			<div class="rounded bg-red-50 p-2 text-sm text-red-600">
				{error}
			</div>
		{/if}
	</aside>
	<main class="flex flex-1 flex-col overflow-hidden">
		<div class="relative flex-1 overflow-visible bg-white">
			<svg width={SVG_WIDTH} height={SVG_HEIGHT} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
				{#each Array(5) as _, i}
					<line
						x1={28 + (i / 4) * (SVG_WIDTH - 56)}
						y1="28"
						x2={28 + (i / 4) * (SVG_WIDTH - 56)}
						y2={SVG_HEIGHT - 28}
						stroke="#f1f5f9"
					/>

					<line
						x1="28"
						y1={28 + (i / 4) * (SVG_HEIGHT - 56)}
						x2={SVG_WIDTH - 28}
						y2={28 + (i / 4) * (SVG_HEIGHT - 56)}
						stroke="#f1f5f9"
					/>
				{/each}

				{#each result?.locals ?? [] as doc}
					{@const pos = pointPosition(doc, SVG_WIDTH, SVG_HEIGHT, 40)}

					<circle
						role="presentation"
						cx={pos.x}
						cy={pos.y}
						r={hovered === doc ? 8 : 5}
						fill={colorForCluster(doc.cluster)}
						opacity={hovered === doc ? 1 : 0.85}
						stroke={hovered === doc ? '#111827' : 'none'}
						stroke-width="2"
						onpointerenter={() => {
							hovered = doc;
							hoveredPosition = pointPosition(doc, SVG_WIDTH, SVG_HEIGHT, 40);
						}}
						onpointerleave={() => (hovered = null)}
					/>

					{#if showLabels}
						<text
							x={pos.x}
							y={pos.y + 20}
							text-anchor="middle"
							font-size="10"
							fill={colorForCluster(doc.cluster)}
						>
							{doc.filename}
						</text>
					{/if}
				{/each}
			</svg>
			{#if hovered && !showLabels}
				<div
					class="pointer-events-none absolute z-50 rounded bg-gray-900 px-3 py-2 text-xs text-white shadow-lg"
					style="
			left: {hoveredPosition.x}px;
			top: {hoveredPosition.y}px;
			transform: translate(-50%, -120%);
		"
				>
					<div class="font-medium text-blue-200">
						{hovered.filename}
					</div>

					<div class="mt-1 opacity-80">
						x: {hovered.x.toFixed(4)}
						· y: {hovered.y.toFixed(4)}
					</div>

					<div class="opacity-80">
						cluster: {hovered.cluster ?? '—'}
					</div>
				</div>
			{/if}

			{#if !result && !loading}
				<div class="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
					Configura los parámetros, selecciona archivos y ejecuta
				</div>
			{/if}
		</div>
	</main>
</div>
