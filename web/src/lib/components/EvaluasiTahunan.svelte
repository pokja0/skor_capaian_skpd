<script>
	import { Card, CardHeader, CardTitle, CardContent } from '#lib/components/ui/card';
	import { num } from '#lib/utils.js';

	let { data } = $props();

	const tahun = $derived(data?.tahun ?? []);
	const baris = $derived(data?.baris ?? []);

	const WARNA = ['#2563eb', '#0ea5e9', '#0f766e', '#14b8a6', '#b7791f', '#7c5cd6', '#c0392b'];
	const seri = $derived(baris.map((b, i) => ({ nama: b.nama, nilai: b.nilai, warna: WARNA[i % WARNA.length] })));

	let pilih = $state(0);
	let hover = $state(null);

	const aktif = $derived(seri[pilih] ?? seri[0] ?? null);
	const nilai = $derived(aktif?.nilai ?? []);

	// Skala
	const L = 56;
	const R = 744;
	const T = 12;
	const B = 158;
	const W = R - L;
	const H = B - T;

	const adaNilai = $derived(nilai.filter((v) => v !== null && v !== undefined));

	const yMin = $derived.by(() => {
		if (!adaNilai.length) return 0;
		const mn = Math.min(...adaNilai);
		const mx = Math.max(...adaNilai);
		const pad = Math.max(4, (mx - mn) * 0.18);
		return Math.max(0, Math.floor((mn - pad) / 5) * 5);
	});
	const yMax = $derived.by(() => {
		if (!adaNilai.length) return 100;
		const mn = Math.min(...adaNilai);
		const mx = Math.max(...adaNilai);
		const pad = Math.max(4, (mx - mn) * 0.18);
		return Math.min(100, Math.ceil((mx + pad) / 5) * 5);
	});

	const x = (i) => L + (tahun.length > 1 ? (i * W) / (tahun.length - 1) : W / 2);
	const y = (v) => B - ((v - yMin) / (yMax - yMin || 1)) * H;

	const titik = $derived(
		nilai.map((v, i) => (v === null || v === undefined ? null : { i, v, cx: x(i), cy: y(v) })).filter(Boolean)
	);
	const jalur = $derived(titik.map((p) => `${p.cx},${p.cy}`).join(' '));
	const area = $derived(
		titik.length
			? `M ${titik[0].cx} ${B} L ${titik.map((p) => `${p.cx} ${p.cy}`).join(' L ')} L ${titik[titik.length - 1].cx} ${B} Z`
			: ''
	);

	const kisi = $derived.by(() => {
		const n = 4;
		const out = [];
		for (let i = 0; i <= n; i++) out.push(yMin + ((yMax - yMin) * i) / n);
		return out;
	});

	const delta = (arr, i) => {
		const prev = arr[i - 1];
		const cur = arr[i];
		if (prev === null || prev === undefined || cur === null || cur === undefined) return null;
		return cur - prev;
	};

	const hoverData = $derived.by(() => {
		if (hover === null) return null;
		const v = nilai[hover];
		if (v === null || v === undefined) return null;
		return { tahun: tahun[hover], v, d: delta(nilai, hover) };
	});

	const posTip = $derived(hover === null ? 50 : Math.min(88, Math.max(12, (x(hover) / 760) * 100)));

	// ringkasan kartu
	const kartu = $derived(
		seri.map((s, i) => {
			const ada = s.nilai.map((v, k) => ({ v, k })).filter((o) => o.v !== null && o.v !== undefined);
			const terakhir = ada.length ? ada[ada.length - 1] : null;
			const d = terakhir && ada.length > 1 ? terakhir.v - ada[ada.length - 2].v : null;
			return { ...s, i, terakhir: terakhir?.v ?? null, d, tahunTerakhir: terakhir ? tahun[terakhir.k] : null };
		})
	);
</script>

<Card class="break-inside-avoid">
	<CardHeader>
		<div class="flex flex-wrap items-baseline justify-between gap-2">
			<CardTitle class="judul-kartu">Tren Data Evaluasi 2020–2026</CardTitle>
			<span class="text-[11.5px] text-muted-foreground">Pilih indikator untuk melihat grafiknya</span>
		</div>
	</CardHeader>
	<CardContent>
		<!-- Pemilih indikator -->
		<div class="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
			{#each kartu as k (k.nama)}
				{@const on = pilih === k.i}
				<button
					type="button"
					onclick={() => { pilih = k.i; hover = null; }}
					class="cursor-pointer rounded-lg border bg-white px-3 py-2.5 text-left transition-all {on
						? 'shadow-md ring-2 ring-offset-1'
						: 'hover:shadow-sm'}"
					style="border-color:{on ? k.warna : 'var(--border)'};{on ? `--tw-ring-color:${k.warna}` : ''}"
					aria-pressed={on}
				>
					<div class="flex items-center gap-1.5">
						<span class="inline-block h-2 w-2 shrink-0 rounded-full" style="background:{k.warna}"></span>
						<span class="truncate text-[11.5px] font-semibold text-muted-foreground" title={k.nama}>{k.nama}</span>
					</div>
					<div class="mt-1 flex items-baseline gap-1.5">
						<span class="tnum text-lg font-extrabold leading-none" style="color:{k.warna}">
							{k.terakhir === null ? '–' : num(k.terakhir, 2)}
						</span>
						{#if k.d !== null}
							<span
								class="tnum text-[11px] font-bold"
								style="color:{k.d < 0 ? 'var(--kat-kurang)' : 'var(--kat-sangat-baik)'}"
							>
								{k.d > 0 ? '▲' : k.d < 0 ? '▼' : '■'} {num(Math.abs(k.d), 2)}
							</span>
						{/if}
					</div>
					<div class="mt-0.5 text-[10.5px] text-muted-foreground">terakhir {k.tahunTerakhir ?? '–'}</div>
				</button>
			{/each}
		</div>

		<!-- Grafik -->
		<div class="relative mt-4">
			<div class="min-w-0 overflow-x-auto">
				<svg viewBox="0 0 760 200" class="h-auto w-full min-w-[520px]" role="img" aria-label={`Tren ${aktif?.nama ?? ''} 2020-2026`}>
					<defs>
						<linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stop-color={aktif?.warna ?? '#2563eb'} stop-opacity="0.28" />
							<stop offset="100%" stop-color={aktif?.warna ?? '#2563eb'} stop-opacity="0.02" />
						</linearGradient>
					</defs>

					<!-- kisi -->
					{#each kisi as v, i (i)}
						<line x1={L} y1={y(v)} x2={R} y2={y(v)} stroke="var(--border)" stroke-width="1" stroke-dasharray={i === 0 ? '' : '3 4'} />
						<text x={L - 10} y={y(v) + 4} text-anchor="end" font-size="10.5" fill="var(--muted-foreground)">{Math.round(v)}</text>
					{/each}

					<!-- area + garis -->
					{#if area}
						<path d={area} fill="url(#area-grad)" />
						<polyline
							points={jalur}
							fill="none"
							stroke={aktif?.warna}
							stroke-width="2.6"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					{/if}

					<!-- penanda hover -->
					{#if hover !== null && nilai[hover] !== null}
						<line x1={x(hover)} y1={T} x2={x(hover)} y2={B} stroke={aktif?.warna} stroke-width="1" stroke-dasharray="4 3" opacity="0.55" />
					{/if}

					<!-- titik -->
					{#each titik as p (p.i)}
						<circle
							cx={p.cx}
							cy={p.cy}
							r={hover === p.i ? 6 : 4}
							fill="#fff"
							stroke={aktif?.warna}
							stroke-width="2.4"
							style="transition: r .15s ease"
						/>
					{/each}

					<!-- area tangkap hover -->
					{#each tahun as t, i (t)}
						<rect
							x={x(i) - (W / Math.max(1, tahun.length - 1)) / 2}
							y={T}
							width={W / Math.max(1, tahun.length - 1)}
							height={H}
							fill="transparent"
							onmouseenter={() => (hover = i)}
							onmouseleave={() => (hover = null)}
							style="cursor:crosshair"
						/>
					{/each}

					<!-- label tahun -->
					{#each tahun as t, i (t)}
						<text
							x={x(i)}
							y={B + 22}
							text-anchor="middle"
							font-size="11"
							font-weight={hover === i ? '700' : '400'}
							fill={hover === i ? 'var(--foreground)' : 'var(--muted-foreground)'}>{t}</text>
					{/each}
				</svg>
			</div>

			<!-- tooltip -->
			{#if hoverData}
				<div
					class="pointer-events-none absolute top-2 z-10 w-[168px] -translate-x-1/2 rounded-lg border bg-white px-3 py-2 shadow-lg"
					style="left:{posTip}%"
				>
					<div class="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{hoverData.tahun}</div>
					<div class="tnum text-lg font-extrabold leading-tight" style="color:{aktif?.warna}">
						{num(hoverData.v, 2)}
					</div>
					{#if hoverData.d !== null}
						<div class="tnum text-[11px] font-semibold" style="color:{hoverData.d < 0 ? 'var(--kat-kurang)' : 'var(--kat-sangat-baik)'}">
							{hoverData.d > 0 ? '+' : ''}{num(hoverData.d, 2)} dari tahun sebelumnya
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- tabel angka -->
		<details class="mt-3">
			<summary class="cursor-pointer text-[12px] font-semibold text-[color:var(--primary)]">Lihat angka per tahun</summary>
			<div class="mt-2 overflow-x-auto">
				<table class="w-full min-w-[620px] text-sm">
					<thead>
						<tr class="border-b text-[11px] uppercase tracking-wide text-muted-foreground">
							<th class="py-2 pr-3 text-left font-semibold">Indikator</th>
							{#each tahun as t (t)}
								<th class="px-2 py-2 text-right font-semibold">{t}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each baris as b, idx (b.nama)}
							<tr class="border-b last:border-0 {idx === pilih ? 'bg-[color:var(--accent)]/40' : ''}">
								<td class="py-2 pr-3 font-medium">
									<span class="mr-1.5 inline-block h-2 w-2 rounded-full" style="background:{WARNA[idx % WARNA.length]}"></span>
									{b.nama}
								</td>
								{#each b.nilai as v, i (i)}
									<td class="tnum px-2 py-2 text-right">{v === null ? '–' : num(v, 2)}</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</details>
	</CardContent>
</Card>
