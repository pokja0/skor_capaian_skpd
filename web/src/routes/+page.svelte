<script>
	import { onMount } from 'svelte';
	import { dataSkor, muatData } from '#lib/data-skor.svelte.js';
	import { KATEGORI_URUT, KATEGORI_WARNA } from '#lib/skoring.js';
	import { num } from '#lib/utils.js';

	import RingkasanInsight from '#lib/components/RingkasanInsight.svelte';
	import KartuAlert from '#lib/components/KartuAlert.svelte';
	import DonutKategori from '#lib/components/DonutKategori.svelte';
	import ScatterKinerjaAnggaran from '#lib/components/ScatterKinerjaAnggaran.svelte';
	import EvaluasiTahunan from '#lib/components/EvaluasiTahunan.svelte';
	import KomponenSakipRb from '#lib/components/KomponenSakipRb.svelte';
	import RingkasanSpm from '#lib/components/RingkasanSpm.svelte';

	onMount(muatData);

	const kuadran = $derived(dataSkor.kuadran);
	const hasilK = $derived(kuadran.hasil);
	const ringkas = $derived(dataSkor.ringkas);
	const sheet = $derived(dataSkor.ringkasanSheet);

	const donut = $derived.by(() => {
		let off = 0;
		const segmen = KATEGORI_URUT.filter((k) => ringkas.kategori[k] > 0).map((k) => {
			const n = ringkas.kategori[k];
			const len = (n / ringkas.jumlah) * 100;
			const s = { k, n, len, off, warna: KATEGORI_WARNA[k] };
			off += len;
			return s;
		});
		const daftar = KATEGORI_URUT.map((k) => ({ k, n: ringkas.kategori[k], warna: KATEGORI_WARNA[k] }));
		return { segmen, daftar, jumlah: ringkas.jumlah };
	});

	const capaianNol = $derived(hasilK.filter((h) => h.capaianNol).sort((a, b) => a.skor - b.skor));
	const kurang = $derived(hasilK.filter((h) => h.kategori === 'Kurang').sort((a, b) => a.skor - b.skor));

	const kpi = $derived([
		{ label: 'SKPD dinilai', nilai: String(ringkas.jumlah), catatan: 'seluruh perangkat daerah' },
		{ label: 'Skor tertinggi', nilai: num(ringkas.skorMax, 2), catatan: ringkas.juara?.skpd ?? '' },
		{ label: 'Rata-rata', nilai: num(ringkas.skorRata, 2), catatan: `median ${num(ringkas.skorMedian, 2)}` },
		{ label: 'Perlu perhatian', nilai: String(ringkas.perhatian), catatan: 'Kurang + Skor 0' }
	]);
</script>

<svelte:head>
	<title>Ringkasan — Penilaian Kinerja SKPD</title>
</svelte:head>

<!-- KPI -->
<section class="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
	{#each kpi as k (k.label)}
		<div class="kartu-hover rounded-xl border border-t-4 border-t-[color:var(--dim-hasil)] bg-white px-4 py-3.5 shadow-sm">
			<div class="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{k.label}</div>
			<div class="tnum mt-1.5 text-2xl font-extrabold leading-none text-[color:var(--primary)]">{k.nilai}</div>
			<div class="mt-1.5 line-clamp-1 text-[11.5px] text-muted-foreground" title={k.catatan}>{k.catatan}</div>
		</div>
	{/each}
</section>

<!-- Insight + distribusi -->
<section class="mt-4 grid gap-4 lg:grid-cols-2">
	<RingkasanInsight hasil={hasilK} {ringkas} />
	<DonutKategori data={donut} />
</section>

<!-- Tren -->
<section class="mt-4">
	<EvaluasiTahunan data={sheet?.evaluasi} />
</section>

<!-- Perlu perhatian -->
<section class="mt-4 grid items-start gap-4 md:grid-cols-2">
	<KartuAlert tone="prioritas" judul="Prioritas">
		{#if capaianNol.length}
			<b>{capaianNol.length} SKPD</b> bercapaian kinerja <b>0</b> sehingga berskor 0 — perlu klarifikasi
			capaian: <i>{capaianNol.map((h) => h.skpd).join(', ')}</i>.
		{:else}
			Tidak ada SKPD bercapaian 0.
		{/if}
	</KartuAlert>
	<KartuAlert tone="perhatian" judul="Perhatian">
		{#if kurang.length}
			<b>{kurang.length} SKPD</b> berkategori <b>Kurang</b> (skor &lt; 45):
			<i>{kurang.map((h) => h.skpd).join(', ')}</i>.
		{:else}
			Tidak ada SKPD berkategori Kurang.
		{/if}
	</KartuAlert>
</section>

<!-- Kinerja vs Anggaran -->
<section class="mt-4">
	<ScatterKinerjaAnggaran hasil={hasilK} xBar={kuadran.xBar} yBar={kuadran.yBar} />
</section>

<!-- Ringkasan sheet tambahan -->
<section class="mt-4 grid gap-4 xl:grid-cols-2">
	<KomponenSakipRb baris={sheet?.sakipRb ?? []} />
	<RingkasanSpm baris={sheet?.spm ?? []} />
</section>

<!-- Catatan -->
<section class="mt-4 rounded-xl border bg-white p-5 shadow-sm">
	<details>
		<summary class="judul-kartu cursor-pointer">Catatan Penting &amp; Metodologi</summary>
		<div class="mt-4 space-y-5 text-sm leading-relaxed text-[#33475b]">
			<div>
				<h3 class="mb-2 font-semibold text-foreground">Catatan penting</h3>
				<ul class="list-disc space-y-1.5 pl-5">
					<li>
						<b>10 indikator → 3 dimensi.</b> D1 Hasil (capaian), D2 Eksekusi (keuangan), D3 Kapasitas &amp;
						Kepatuhan (inovasi, kematangan PD, SPBE, SAKIP, PEKPP, SPM, Evidence MCsP &amp; SPI).
					</li>
					<li><b>Bobot dimensi setara 33,3%.</b> Di dalam D3, indikator dinilai setara dan dirata-ratakan.</li>
					<li><b>Skor akhir = ∛(D1 × D2 × D3)</b> — non-kompensatoris: capaian 0 membuat skor 0.</li>
					<li><b>Data kosong tidak dihitung;</b> bobot dinormalisasi ulang. <b>Nilai 0 tetap dinilai 0.</b></li>
					<li><b>Periode:</b> capaian &amp; keuangan Triwulan III; SPBE Triwulan II; SAKIP 2025.</li>
					<li><b>Merah</b> pada rincian indikator = nilai di bawah rata-rata SKPD pada indikator tersebut.</li>
				</ul>
			</div>
			<div>
				<h3 class="mb-2 font-semibold text-foreground">Metodologi</h3>
				<div class="space-y-3">
					<p>
						<b>Normalisasi absolut.</b> Capaian dipotong di 110%; keuangan memakai target 100%; SPBE dan PEKPP
						(0–5) diskalakan ×20; indikator lain memakai skala aslinya (0–100).
					</p>
					<p>
						<b>Agregasi.</b> Skor dimensi D3 = rata-rata aritmetik indikator yang tersedia. Skor akhir =
						rata-rata geometrik antar-dimensi.
					</p>
					<p>
						<b>Kategori.</b> Sangat Baik ≥ 70, Baik 60–70, Cukup 45–60, Kurang &lt; 45, Skor 0 untuk skor nol.
					</p>
					<p>
						<b>Sumber data.</b> Google Sheet “Capaian OPD” — dibaca langsung saat halaman dibuka, dengan
						snapshot hasil build sebagai cadangan.
					</p>
				</div>
			</div>
		</div>
	</details>
</section>
