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

		const perTipe = {};
		const totalTipe = {};
		for (const h of hasil) totalTipe[h.tipe] = (totalTipe[h.tipe] || 0) + 1;
		for (const h of hasil) {
			if (h.kategori === 'Cukup' || h.kategori === 'Kurang' || h.kategori === 'Skor 0')
				perTipe[h.tipe] = (perTipe[h.tipe] || 0) + 1;
		}
		let tipeTerburuk = null;
		for (const t of Object.keys(totalTipe)) {
			if (totalTipe[t] < 3) continue;
			const rasio = (perTipe[t] || 0) / totalTipe[t];
			if (!tipeTerburuk || rasio > tipeTerburuk.rasio)
				tipeTerburuk = { tipe: t, jumlah: perTipe[t] || 0, total: totalTipe[t], rasio };
		}
		return { rH, rE, rK, tipeTerburuk };
	});
</script>

<Card class="break-inside-avoid">
	<CardHeader>
		<CardTitle class="judul-kartu">Ringkasan &amp; Insight</CardTitle>
	</CardHeader>
	<CardContent>
		<!-- Tiga angka kunci -->
		<div class="grid grid-cols-3 gap-2 sm:gap-3">
			<div
				class="rounded-xl border border-t-4 border-t-[color:var(--dim-hasil)] bg-white px-2 py-3 text-center shadow-sm sm:px-3"
			>
				<div class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-[11px]">
					Rata-rata
				</div>
				<div class="tnum mt-1 text-base font-extrabold leading-none text-[color:var(--primary)] sm:text-2xl">
					{num(ringkas.skorRata, 2)}
				</div>
			</div>
			<div
				class="rounded-xl border border-t-4 border-t-[color:var(--dim-eksekusi)] bg-white px-2 py-3 text-center shadow-sm sm:px-3"
			>
				<div class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-[11px]">
					Median
				</div>
				<div class="tnum mt-1 text-base font-extrabold leading-none text-[color:var(--primary)] sm:text-2xl">
					{num(ringkas.skorMedian, 2)}
				</div>
			</div>
			<div
				class="rounded-xl border border-t-4 border-t-[color:var(--dim-kapasitas)] bg-white px-2 py-3 text-center shadow-sm sm:px-3"
			>
				<div class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-[11px]">
					Rentang
				</div>
				<div class="tnum mt-1 whitespace-nowrap text-[13px] font-extrabold leading-none text-[color:var(--primary)] sm:text-xl">
					{num(ringkas.skorMin, 2)}–{num(ringkas.skorMax, 2)}
				</div>
			</div>
		</div>

		<!-- Analisis -->
		<ul class="mt-4 space-y-3">
			<li class="flex gap-2.5">
				<span
					class="mt-[2px] grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[color:var(--dim-hasil)]/12 text-[11px] font-bold text-[color:var(--dim-hasil)]"
					>1</span
				>
				<span class="text-sm leading-relaxed text-[#33475b]">
					Dimensi <b>Capaian Kinerja</b> paling lemah secara rata-rata (<b class="tnum"
						>{num(info.rH, 2)}</b
					>), di bawah Realisasi Anggaran (<span class="tnum">{num(info.rE, 2)}</span>) dan Kapasitas
					(<span class="tnum">{num(info.rK, 2)}</span>). Perbaikan capaian kinerja berdampak paling besar.
				</span>
			</li>
			{#if info.tipeTerburuk}
				<li class="flex gap-2.5">
					<span
						class="mt-[2px] grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[color:var(--kat-cukup)]/20 text-[11px] font-bold text-[#b97e00]"
						>2</span
					>
					<span class="text-sm leading-relaxed text-[#33475b]">
						Kelompok <b>{info.tipeTerburuk.tipe}</b> paling tertinggal: <b class="tnum"
							>{info.tipeTerburuk.jumlah} dari {info.tipeTerburuk.total}</b
						> unitnya berkinerja Cukup atau lebih rendah.
					</span>
				</li>
			{/if}
		</ul>
	</CardContent>
</Card>
