<script>
	import { Card, CardHeader, CardTitle, CardContent } from '#lib/components/ui/card';
	import { num } from '#lib/utils.js';

	let { hasil, ringkas } = $props();

	const info = $derived.by(() => {
		const hidup = hasil.filter((h) => h.skor > 0);
		const rata = (k) => hidup.reduce((a, h) => a + h[k], 0) / hidup.length;
		const rH = rata('d1');
		const rE = rata('d2');
		const rK = rata('d3');

		// kelompok yang paling tertinggal
		const perTipe = {};
		const totalTipe = {};
		for (const h of hasil) totalTipe[h.tipe] = (totalTipe[h.tipe] || 0) + 1;
		for (const h of hasil) {
			if (h.kategori === 'Cukup' || h.kategori === 'Kurang' || h.kategori === 'Capaian 0')
				perTipe[h.tipe] = (perTipe[h.tipe] || 0) + 1;
		}
		let tipeTerburuk = null;
		for (const t of Object.keys(totalTipe)) {
			if (totalTipe[t] < 3) continue;
			const rasio = (perTipe[t] || 0) / totalTipe[t];
			if (!tipeTerburuk || rasio > tipeTerburuk.rasio)
				tipeTerburuk = { tipe: t, jumlah: perTipe[t] || 0, total: totalTipe[t], rasio };
		}

		// serapan tinggi tetapi capaian rendah kini disajikan pada grafik "Kinerja vs Anggaran"
		return {
			rH,
			rE,
			rK,
			tipeTerburuk,
			rentangBawah: ringkas.skorMin,
			rentangAtas: ringkas.skorMax
		};
	});
</script>

<Card class="break-inside-avoid">
	<CardHeader>
		<CardTitle class="text-base text-[color:var(--primary)]">Ringkasan &amp; Insight</CardTitle>
	</CardHeader>
	<CardContent>
		<!-- Angka kunci (tidak ditampilkan di bagian lain) -->
		<div class="grid grid-cols-3 divide-x rounded-lg border bg-[color:var(--muted)]/60">
			<div class="px-3 py-2.5 text-center">
				<div class="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Rata-rata</div>
				<div class="tnum text-xl font-bold text-[color:var(--primary)]">{num(ringkas.skorRata, 2)}</div>
			</div>
			<div class="px-3 py-2.5 text-center">
				<div class="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Median</div>
				<div class="tnum text-xl font-bold text-[color:var(--primary)]">{num(ringkas.skorMedian, 2)}</div>
			</div>
			<div class="px-3 py-2.5 text-center">
				<div class="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Rentang</div>
				<div class="tnum text-xl font-bold text-[color:var(--primary)]">
					{num(info.rentangBawah, 2)}–{num(info.rentangAtas, 2)}
				</div>
			</div>
		</div>

		<!-- Analisis -->
		<ul class="mt-4 space-y-2.5 text-[13.5px] leading-relaxed text-[#33475b]">
			<li class="flex gap-2">
				<span class="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--primary)]"></span>
				<span>
					Dimensi <b>Hasil Kinerja</b> adalah yang terlemah secara rata-rata
					(<b class="tnum">{num(info.rH, 2)}</b>), di bawah Eksekusi (<span class="tnum"
						>{num(info.rE, 2)}</span
					>) dan Kapasitas (<span class="tnum">{num(info.rK, 2)}</span>). Perbaikan pada capaian kinerja
					berdampak paling besar terhadap skor.
				</span>
			</li>
			{#if info.tipeTerburuk}
				<li class="flex gap-2">
					<span class="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--primary)]"></span>
					<span>
						Kelompok <b>{info.tipeTerburuk.tipe}</b> paling tertinggal: <b class="tnum"
							>{info.tipeTerburuk.jumlah} dari {info.tipeTerburuk.total}</b
						> unitnya berkinerja Cukup atau lebih rendah.
					</span>
				</li>
			{/if}
		</ul>
	</CardContent>
</Card>
