<script>
	import { Card, CardHeader, CardTitle, CardContent } from '#lib/components/ui/card';
	import { KATEGORI_URUT, KATEGORI_WARNA, KUADRAN, KUADRAN_URUT } from '#lib/skoring.js';
	import { num } from '#lib/utils.js';

	let { hasil, xBar, yBar } = $props();

	// --- Skala tetap agar kuadran tetap sebanding ---
	const X_MAKS = 100; // realisasi keuangan (%)
	const Y_MAKS = 120; // capaian kinerja (%)
	// Kanvas lebar (rasio lebar) supaya grafik memenuhi kartu tanpa jadi tinggi
	const L = 64,
		R = 1160,
		T = 18,
		B = 392;
	const W = R - L;
	const H = B - T;

	const px = (v) => L + (v / X_MAKS) * W;
	const py = (v) => B - (v / Y_MAKS) * H;

	const perKuadran = $derived.by(() => {
		const q = { kananAtas: [], kananBawah: [], kiriAtas: [], kiriBawah: [] };
		for (const h of hasil) q[h.kuadran].push(h);
		for (const k of KUADRAN_URUT) q[k].sort((a, b) => a.peringkat - b.peringkat);
		return q;
	});

	const labelTetap = [...hasil].sort((a, b) => a.peringkat - b.peringkat).slice(0, 3);
	const labelNomor = $derived(new Set(labelTetap.map((h) => h.no)));
	// Posisi label dengan penghindaran tumpang-tindih
	const labelPos = $derived.by(() => {
		const arr = labelTetap.map((h) => {
			const cy = py(h.capaian);
			const diBawah = cy < T + 26; // titik sangat tinggi -> label di bawah titik
			return { h, x: px(h.keuangan), y: diBawah ? cy + 19 : cy - 12 };
		});
		arr.sort((a, b) => a.x - b.x);
		for (let i = 0; i < arr.length; i++) {
			for (let j = 0; j < i; j++) {
				if (Math.abs(arr[i].x - arr[j].x) < 100 && Math.abs(arr[i].y - arr[j].y) < 13) {
					arr[i].y = arr[j].y - 13;
				}
			}
		}
		return arr;
	});

	const tikX = [0, 20, 40, 60, 80, 100];
	const tikY = [0, 20, 40, 60, 80, 100, 120];

	let hover = $state(null);
	let pilih = $state(null); // kuadran terpilih

	function pilihKuadran(k) {
		pilih = pilih === k ? null : k;
	}
	const tampak = (h) => pilih === null || h.kuadran === pilih;
</script>

<Card class="break-inside-avoid">
	<CardHeader>
		<CardTitle class="text-base text-[color:var(--primary)]">Kinerja vs Anggaran</CardTitle>
	</CardHeader>
	<CardContent>
		<div class="mb-2 text-[11px] text-muted-foreground pdf-hide sm:hidden">
			← Geser grafik ke samping untuk melihat seluruhnya →
		</div>
		<div class="min-w-0 overflow-x-auto">
			<svg viewBox="0 0 1180 430" class="mx-auto h-auto w-full min-w-[860px]" role="img">
				<!-- bidang kuadran -->
				<rect x={px(xBar)} y={T} width={R - px(xBar)} height={py(yBar) - T} fill="var(--dim-eksekusi)" opacity="0.05" />
				<rect x={px(xBar)} y={py(yBar)} width={R - px(xBar)} height={B - py(yBar)} fill="var(--kat-kurang)" opacity="0.05" />
				<rect x={L} y={T} width={px(xBar) - L} height={py(yBar) - T} fill="var(--dim-hasil)" opacity="0.05" />
				<rect x={L} y={py(yBar)} width={px(xBar) - L} height={B - py(yBar)} fill="var(--kat-cukup)" opacity="0.05" />

				<!-- grid -->
				{#each tikX as tx (tx)}
					<line x1={px(tx)} y1={T} x2={px(tx)} y2={B} stroke="var(--border)" stroke-width="1" />
					<text x={px(tx)} y={B + 16} text-anchor="middle" font-size="10" fill="#5b6b7c">{tx}%</text>
				{/each}
				{#each tikY as ty (ty)}
					<line x1={L} y1={py(ty)} x2={R} y2={py(ty)} stroke="var(--border)" stroke-width="1" />
					<text x={L - 8} y={py(ty) + 3} text-anchor="end" font-size="10" fill="#5b6b7c">{ty}</text>
				{/each}

				<!-- garis rata-rata -->
				<line x1={px(xBar)} y1={T} x2={px(xBar)} y2={B} stroke="#8a97a8" stroke-width="1.2" stroke-dasharray="5 4" />
				<line x1={L} y1={py(yBar)} x2={R} y2={py(yBar)} stroke="#8a97a8" stroke-width="1.2" stroke-dasharray="5 4" />

				<!-- label kuadran -->
				<text x={R - 6} y={T + 13} text-anchor="end" font-size="10.5" font-weight="600" fill="var(--dim-eksekusi)" opacity="0.85">
					Capaian &amp; serapan di atas rata-rata
				</text>
				<text x={R - 6} y={B - 6} text-anchor="end" font-size="10.5" font-weight="600" fill="var(--kat-kurang)" opacity="0.9">
					Serapan tinggi, capaian rendah — telusuri
				</text>
				<text x={L + 6} y={T + 13} font-size="10.5" font-weight="600" fill="var(--dim-hasil)" opacity="0.85">
					Capaian tinggi, serapan hemat
				</text>

				<!-- sumbu -->
				<line x1={L} y1={B} x2={R} y2={B} stroke="#8a97a8" stroke-width="1.4" />
				<line x1={L} y1={T} x2={L} y2={B} stroke="#8a97a8" stroke-width="1.4" />
				<text x={(L + R) / 2} y={B + 34} text-anchor="middle" font-size="11" font-weight="600" fill="#33475b">
					Penyerapan Anggaran (%) →
				</text>
				<text x={16} y={(T + B) / 2} text-anchor="middle" font-size="11" font-weight="600" fill="#33475b" transform="rotate(-90 16 {(T + B) / 2})">
					Capaian Kinerja (%)
				</text>

				<!-- titik -->
				{#each hasil as h (h.no)}
					<circle
						cx={px(h.keuangan)}
						cy={py(h.capaian)}
						r={hover === h.no || labelNomor.has(h.no) || (pilih && h.kuadran === pilih) ? 6.8 : 5.2}
						fill={KATEGORI_WARNA[h.kategori]}
						stroke="#ffffff"
						stroke-width="1.6"
						opacity={tampak(h) ? (hover && hover !== h.no ? 0.35 : 0.92) : 0.12}
						onmouseenter={() => (hover = h.no)}
						onmouseleave={() => (hover = null)}
						style="cursor:pointer"
					>
						<title>{h.namaPendek} — Capaian {num(h.capaian, 2)}% · Keuangan {num(h.keuangan, 2)}% · Skor {num(h.skor, 2)}</title>
					</circle>
				{/each}

				<!-- label tetap -->
				{#each labelPos as lp (lp.h.no)}
					<text
						x={lp.x}
						y={lp.y}
						text-anchor="middle"
						font-size="10"
						font-weight="700"
						fill="var(--primary)"
						opacity={tampak(lp.h) ? 1 : 0.2}
					>
						{lp.h.namaPendek}
					</text>
				{/each}

				<!-- tooltip -->
				{#if hover}
					{@const h = hasil.find((x) => x.no === hover)}
					{@const bx = Math.min(Math.max(px(h.keuangan) - 110, L), R - 220)}
					{@const by = py(h.capaian) > T + 70 ? py(h.capaian) - 66 : py(h.capaian) + 16}
					<g pointer-events="none">
						<rect x={bx} y={by} width="220" height="56" rx="7" fill="#17365d" opacity="0.96" />
						<text x={bx + 10} y={by + 17} font-size="11" font-weight="700" fill="#ffffff">
							{h.namaPendek.length > 30 ? h.namaPendek.slice(0, 29) + '…' : h.namaPendek}
						</text>
						<text x={bx + 10} y={by + 33} font-size="10.5" fill="#d7e3f2">
							Capaian {num(h.capaian, 2)}% · Keuangan {num(h.keuangan, 2)}%
						</text>
						<text x={bx + 10} y={by + 48} font-size="10.5" fill="#9fc0e6">
							Skor {num(h.skor, 2)} · {h.kategori}
						</text>
					</g>
				{/if}
			</svg>
		</div>

		<!-- kuadran (dapat diklik) -->
		<div class="no-print mt-3 flex flex-wrap items-center justify-between gap-2">
			<div class="text-[11.5px] text-muted-foreground">
				Klik kuadran untuk melihat daftar SKPD di dalamnya. Garis rata-rata: capaian
				<b class="tnum">{num(yBar, 2)}%</b>, penyerapan <b class="tnum">{num(xBar, 2)}%</b>.
			</div>
			{#if pilih}
				<button
					type="button"
					class="cursor-pointer rounded-full border bg-white px-3 py-1 text-xs text-muted-foreground hover:bg-[color:var(--accent)]"
					onclick={() => (pilih = null)}
				>
					Tampilkan semua kuadran
				</button>
			{/if}
		</div>

		<div class="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
			{#each KUADRAN_URUT as k (k)}
				{@const q = KUADRAN[k]}
				{@const aktif = pilih === k}
				<button
					type="button"
					onclick={() => pilihKuadran(k)}
					class="no-print cursor-pointer rounded-lg border-l-4 p-2.5 text-left transition-all {aktif
						? 'ring-2 ring-[color:var(--ring)] ring-offset-1'
						: 'hover:brightness-95'}"
					style="border-color:{q.warna};background:{q.bg}"
				>
					<div class="flex items-center gap-1.5">
						<span class="text-[11px] font-semibold" style="color:{q.warna}">{q.label}</span>
						<span class="tnum ml-auto text-[11px] font-bold text-foreground"
							>{perKuadran[k].length} SKPD</span
						>
					</div>
					<div class="text-[11px] leading-snug text-muted-foreground">{q.ket}</div>
				</button>
			{/each}
		</div>

		<!-- daftar SKPD pada kuadran terpilih -->
		{#if pilih}
			<div class="mt-3 overflow-hidden rounded-lg border">
				<div class="flex items-center gap-2 bg-[color:var(--muted)]/70 px-3 py-2">
					<span class="h-2.5 w-2.5 rounded-sm" style="background:{KUADRAN[pilih].warna}"></span>
					<span class="text-[12.5px] font-semibold">{KUADRAN[pilih].label}</span>
					<span class="text-[11.5px] text-muted-foreground"
						>— {KUADRAN[pilih].ket} · {perKuadran[pilih].length} SKPD</span
					>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full min-w-[520px] text-[12.5px]">
						<thead>
							<tr class="border-b bg-white text-[10px] uppercase tracking-wide text-muted-foreground">
								<th class="px-3 py-1.5 text-left font-semibold">#</th>
								<th class="px-3 py-1.5 text-left font-semibold">SKPD</th>
								<th class="px-3 py-1.5 text-right font-semibold">Capaian</th>
								<th class="px-3 py-1.5 text-right font-semibold">Keuangan</th>
								<th class="px-3 py-1.5 text-right font-semibold">Skor</th>
								<th class="px-3 py-1.5 text-left font-semibold">Kategori</th>
							</tr>
						</thead>
						<tbody>
							{#each perKuadran[pilih] as h (h.no)}
								<tr class="border-b last:border-0">
									<td class="tnum px-3 py-1.5 font-semibold text-[color:var(--primary)]">
										{Math.round(h.peringkat)}
									</td>
									<td class="px-3 py-1.5" title={h.skpd}>{h.namaPendek}</td>
									<td class="tnum whitespace-nowrap px-3 py-1.5 text-right">{num(h.capaian, 2)}%</td>
									<td class="tnum whitespace-nowrap px-3 py-1.5 text-right">{num(h.keuangan, 2)}%</td>
									<td class="tnum px-3 py-1.5 text-right font-semibold">{num(h.skor, 2)}</td>
									<td class="px-3 py-1.5">
										<span
											class="inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-medium text-white"
											style="background:{KATEGORI_WARNA[h.kategori]}">{h.kategori}</span
										>
									</td>
								</tr>
							{:else}
								<tr><td colspan="6" class="px-3 py-3 text-center text-muted-foreground">Tidak ada SKPD.</td></tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}

		<div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-muted-foreground">
			{#each KATEGORI_URUT as k (k)}
				<span class="flex items-center gap-1.5"
					><i class="inline-block h-2.5 w-2.5 rounded-full" style="background:{KATEGORI_WARNA[k]}"></i>{k}</span
				>
			{/each}
		</div>
	</CardContent>
</Card>
