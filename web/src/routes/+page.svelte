<script>
	import data from '#lib/data.json';
	import {
		hitungSkor,
		ringkas as hitungRingkas,
		namaPendek,
		tipeSKPD,
		beriKuadran,
		KUADRAN,
		KATEGORI_URUT,
		KATEGORI_WARNA
	} from '#lib/skoring.js';
	import { unduhXlsx, unduhPdf } from '#lib/ekspor.js';
	import { num } from '#lib/utils.js';

	import { Button } from '#lib/components/ui/button';
	import { Badge } from '#lib/components/ui/badge';
	import Podium from '#lib/components/Podium.svelte';
	import RingkasanInsight from '#lib/components/RingkasanInsight.svelte';
	import KartuAlert from '#lib/components/KartuAlert.svelte';
	import PapanPeringkat from '#lib/components/PapanPeringkat.svelte';
	import DonutKategori from '#lib/components/DonutKategori.svelte';
	import ScatterKinerjaAnggaran from '#lib/components/ScatterKinerjaAnggaran.svelte';

	// --- Hitung skor sekali ---
	const dasar = hitungSkor(data.skpd).map((h) => ({
		...h,
		namaPendek: namaPendek(h.skpd),
		tipe: tipeSKPD(h.skpd)
	}));
	const { hasil, xBar, yBar } = beriKuadran(dasar);
	const ringkas = hitungRingkas(hasil);
	const urut = [...hasil].sort((a, b) => a.peringkat - b.peringkat);

	// --- Data turunan ---
	const donut = (() => {
		let off = 0;
		const segmen = KATEGORI_URUT.filter((k) => ringkas.kategori[k] > 0).map((k) => {
			const n = ringkas.kategori[k];
			const len = (n / ringkas.jumlah) * 100;
			const s = { k, n, len, off, warna: KATEGORI_WARNA[k] };
			off += len;
			return s;
		});
		const daftar = KATEGORI_URUT.map((k) => ({
			k,
			n: ringkas.kategori[k],
			warna: KATEGORI_WARNA[k]
		}));
		return { segmen, daftar, jumlah: ringkas.jumlah };
	})();

	const capaianNol = hasil.filter((h) => h.capaianNol).sort((a, b) => a.skor - b.skor);
	const kurang = hasil.filter((h) => h.kategori === 'Kurang').sort((a, b) => a.skor - b.skor);
	const top3 = urut.slice(0, 3);

	let proses = $state(null); // null | 'xlsx' | 'pdf'

	async function onXlsx() {
		if (proses) return; // cegah klik berulang
		proses = 'xlsx';
		try {
			await unduhXlsx(hasil);
		} finally {
			proses = null;
		}
	}

	async function onPdf() {
		if (proses) return; // cegah klik berulang
		proses = 'pdf';
		try {
			await unduhPdf({ hasil, ringkas, xBar, yBar });
		} finally {
			proses = null;
		}
	}
</script>

<svelte:head>
	<title>Penilaian Kinerja SKPD — Pemprov Sulawesi Barat</title>
	<meta name="description" content="Penilaian kinerja perangkat daerah untuk pimpinan" />
</svelte:head>

<div class="mx-auto max-w-[1240px] px-4 py-6 sm:px-6" data-laporan>
	<!-- Header / identitas -->
	<header
		class="overflow-hidden rounded-2xl bg-gradient-to-br from-[#17365d] to-[#1f4e79] text-white shadow-lg print:shadow-none"
	>
		<div class="flex flex-wrap items-start justify-between gap-4 px-5 pt-5 sm:px-6">
			<div class="flex min-w-0 items-center gap-3 sm:gap-4">
				<img
					src="/lambang-sulbar.svg"
					alt="Lambang Provinsi Sulawesi Barat"
					class="h-14 w-auto shrink-0 drop-shadow-md sm:h-20"
				/>
				<div class="min-w-0">
					<p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80 sm:text-[11px]">
						Pemerintah Provinsi Sulawesi Barat
					</p>
					<h1 class="mt-0.5 text-lg font-bold leading-tight sm:text-2xl">Penilaian Kinerja SKPD</h1>
					<p class="mt-0.5 text-sm opacity-90">Capaian Kinerja Triwulan III</p>
					<div class="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
						<Badge
							class="max-w-full border border-white/30 bg-white/15 text-[10px] leading-tight text-white sm:text-xs"
							variant="outline">Metode: Indeks Komposit Non-Kompensatoris</Badge
						>
						<Badge
							class="max-w-full border border-white/30 bg-white/15 text-[10px] leading-tight text-white sm:text-xs"
							variant="outline">Skala 0–100</Badge
						>
					</div>
				</div>
			</div>
			<div class="no-print flex flex-wrap gap-2">
				<Button
					class="border-transparent bg-[#1f7a41] text-white shadow-sm hover:bg-[#186634] disabled:opacity-60"
					onclick={onXlsx}
					disabled={proses !== null}
					title="Unduh seluruh data sebagai berkas Excel"
				>
					{#if proses === 'xlsx'}
						<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.3" stroke-width="4" />
							<path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
						</svg>
						Menyiapkan…
					{:else}
						<svg
							class="h-4 w-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<rect x="3" y="3" width="18" height="18" rx="2" />
							<path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
						</svg>
						Unduh XLSX
					{/if}
				</Button>
				<Button
					class="border-transparent bg-[#c0392b] text-white shadow-sm hover:bg-[#a93226] disabled:opacity-60"
					onclick={onPdf}
					disabled={proses !== null}
					title="Unduh sebagai PDF melalui dialog cetak"
				>
					{#if proses === 'pdf'}
						<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.3" stroke-width="4" />
							<path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
						</svg>
						Menyiapkan…
					{:else}
						<svg
							class="h-4 w-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
							<path d="M14 2v6h6" />
							<path d="M8 13h8M8 17h5" />
						</svg>
						Unduh PDF
					{/if}
				</Button>
			</div>
		</div>
		<div class="mt-4 border-t border-white/15 bg-white/5 px-5 py-2 text-center sm:px-6">
			<span class="text-xs font-semibold italic tracking-wide sm:text-sm"
				>“Sulbar Maju dan Sejahtera”</span
			>
		</div>
	</header>

	<!-- Podium + Ringkasan & Insight -->
	<section class="mt-4 grid gap-4 lg:grid-cols-2">
		<Podium tiga={top3} />
		<RingkasanInsight {hasil} {ringkas} />
	</section>

	<!-- Papan peringkat + sisi kanan -->
	<section class="mt-4 grid gap-4 xl:grid-cols-[2.2fr_1fr]">
		<PapanPeringkat {hasil} {ringkas} />
		<div class="flex min-w-0 flex-col gap-4">
			<DonutKategori data={donut} />
			<div class="flex flex-1 flex-col justify-between gap-2.5">
				<KartuAlert tone="prioritas" judul="Prioritas">
					{#if capaianNol.length}
						<b>{capaianNol.length} SKPD</b> bercapaian kinerja <b>0</b> sehingga berskor 0 — perlu
						klarifikasi capaian: <i>{capaianNol.map((h) => h.namaPendek).join(', ')}</i>.
					{:else}
						Tidak ada SKPD bercapaian 0.
					{/if}
				</KartuAlert>
				<KartuAlert tone="perhatian" judul="Perhatian">
					{#if kurang.length}
						<b>{kurang.length} SKPD</b> berkategori <b>Kurang</b> (skor &lt; 45):
						<i>{kurang.map((h) => h.namaPendek).join(', ')}</i>.
					{:else}
						Tidak ada SKPD berkategori Kurang.
					{/if}
				</KartuAlert>
				<KartuAlert tone="info" judul="Informasi">
					Dimensi <b>Hasil</b> (capaian) dan <b>Eksekusi</b> (keuangan) berbobot masing-masing 33,3%,
					sedangkan empat indikator <b>Kapasitas</b> bersama-sama 33,3%. Klik baris pada tabel untuk
					melihat nilai indikator asli.
				</KartuAlert>
			</div>
		</div>
	</section>

	<!-- Kinerja vs Anggaran -->
	<section class="mt-4">
		<ScatterKinerjaAnggaran {hasil} {xBar} {yBar} />
	</section>

	<!-- Catatan & Metodologi -->
	<section class="mt-4 rounded-xl border bg-white p-5 shadow-sm">
		<details>
			<summary class="cursor-pointer text-base font-semibold text-[color:var(--primary)]"
				>Catatan Penting &amp; Metodologi</summary
			>
			<div class="mt-4 space-y-5 text-[13.5px] leading-relaxed text-[#33475b]">
				<div>
					<h3 class="mb-2 font-semibold text-foreground">Catatan penting</h3>
					<ul class="list-disc space-y-1.5 pl-5">
						<li>
							<b>Cara membaca skor:</b> makin tinggi makin baik (skala 0–100). Dimensi inti — capaian kinerja
							dan realisasi keuangan — masing-masing berbobot 33,3%; empat indikator kapasitas bersama-sama
							33,3%.
						</li>
						<li>
							<b>Enam SKPD bercapaian 0</b> berskor 0 (aturan non-kompensatoris: hasil nol tidak bisa
							"ditutupi" bagian lain). Peringkatnya seri di dasar.
						</li>
						<li>
							<b>Realisasi keuangan tidak berdiri sendiri:</b> agar tidak sekadar mengejar serapan, capaian
							kinerja diberi bobot setara dan SKPD berserapan tinggi namun capaian rendah tetap terlihat
							lemah.
						</li>
						<li>
							<b>Periode tidak seragam:</b> Indeks SPBE memakai Triwulan II dan Nilai SAKIP tahun 2025,
							sedangkan capaian &amp; keuangan Triwulan III. Ditampilkan apa adanya dan dicatat sebagai
							keterbatasan.
						</li>
						<li>
							<b>Indeks SPBE</b> disetarakan dari skala 0–5 ke 0–100 (kali 20) semata-mata agar satuan
							sebanding.
						</li>
					</ul>
				</div>

				<div>
					<h3 class="mb-2 font-semibold text-foreground">Metodologi</h3>
					<div class="space-y-3">
						<p>
							<b>Indikator &amp; dimensi.</b> Enam indikator dikelompokkan menjadi tiga dimensi: <b>Hasil</b>
							(capaian kinerja), <b>Eksekusi</b> (realisasi keuangan), dan <b>Kapasitas</b> (indeks inovasi,
							kematangan perangkat daerah, SPBE, SAKIP).
						</p>
						<p>
							<b>Normalisasi absolut.</b> Skor tidak dihitung relatif terhadap peserta lain, sehingga bila
							seluruh SKPD bernilai baik maka semua tetap memperoleh skor tinggi. Capaian dipotong di 110%;
							realisasi keuangan memakai target 100%; SPBE (0–5) disetarakan ke 0–100.
						</p>
						<p>
							<b>Agregasi geometrik.</b> Skor akhir = ∛(D1 × D2 × D3). Sifatnya non-kompensatoris: kelemahan
							serius pada satu dimensi tidak dapat ditutupi dimensi lain (mengikuti praktik indeks seperti
							IPM).
						</p>
						<p>
							<b>Kategori.</b> Berbasis ambang absolut dan tervalidasi statistik: Sangat Baik ≥ 70, Baik
							60–70, Cukup 45–60, Kurang &lt; 45, serta capaian 0 sebagai kategori khusus.
						</p>
						<p>
							<b>Uji ketahanan.</b> Peringkat puncak dan dasar kokoh terhadap penggantian metode; posisi
							tengah lebih sensitif terhadap bobot. Rincian lengkap ada pada berkas metodologi di repositori.
						</p>
						<p>
							<b>Keterbatasan.</b> Periode antar-indikator tidak seragam (SPBE Triwulan II, SAKIP 2025);
							tidak tersedia data pagu anggaran/jumlah pegawai sehingga perbandingan tidak dapat dikelompokkan
							menurut skala; capaian &gt; 100% tidak dikoreksi terhadap kemungkinan target yang rendah.
						</p>
					</div>
				</div>
			</div>
		</details>
	</section>

	<!-- Lampiran: muncul hanya saat dicetak / diunduh PDF -->
	<section class="mt-4 hidden print:block pdf-tampil print-break">
		<h2 class="mb-2 text-base font-semibold text-[color:var(--primary)]">Lampiran — Data Lengkap</h2>
		<p class="mb-2 text-[11px] text-muted-foreground">
			Seluruh nilai asli indikator, skor tiap dimensi, dan kuadran Kinerja vs Anggaran. Garis pembagi kuadran:
			capaian <b>{num(yBar, 2)}%</b> dan penyerapan <b>{num(xBar, 2)}%</b>.
		</p>
		<table class="lampiran-tabel w-full border-collapse text-[9px]">
			<thead>
				<tr class="bg-[color:var(--primary)] text-white">
					<th rowspan="2" class="border px-1 py-1">#</th>
					<th rowspan="2" class="border px-1 py-1 text-left">SKPD</th>
					<th rowspan="2" class="border px-1 py-1">Skor</th>
					<th rowspan="2" class="border px-1 py-1 text-left">Kategori</th>
					<th colspan="3" class="border px-1 py-1">Skor Dimensi (0–100)</th>
					<th colspan="6" class="border px-1 py-1">Nilai Asli Indikator</th>
					<th rowspan="2" class="border px-1 py-1 text-left">Kuadran</th>
				</tr>
				<tr class="bg-[color:var(--primary)] text-white">
					<th class="border px-1 py-1">Hasil</th>
					<th class="border px-1 py-1">Eksekusi</th>
					<th class="border px-1 py-1">Kapasitas</th>
					<th class="border px-1 py-1">Capaian&nbsp;%</th>
					<th class="border px-1 py-1">Keuangan&nbsp;%</th>
					<th class="border px-1 py-1">Inovasi</th>
					<th class="border px-1 py-1">KPD</th>
					<th class="border px-1 py-1">SPBE</th>
					<th class="border px-1 py-1">SAKIP</th>
				</tr>
			</thead>
			<tbody>
				{#each urut as h (h.no)}
					<tr class="border-b">
						<td class="border px-1 py-[3px] text-center">{Math.round(h.peringkat)}</td>
						<td class="border px-1 py-[3px]">{h.namaPendek}</td>
						<td class="border px-1 py-[3px] text-right">{num(h.skor, 2)}</td>
						<td class="border px-1 py-[3px]">{h.kategori}</td>
						<td class="border px-1 py-[3px] text-right">{num(h.d1, 2)}</td>
						<td class="border px-1 py-[3px] text-right">{num(h.d2, 2)}</td>
						<td class="border px-1 py-[3px] text-right">{num(h.d3, 2)}</td>
						<td class="border px-1 py-[3px] text-right">{num(h.capaian, 2)}</td>
						<td class="border px-1 py-[3px] text-right">{num(h.keuangan, 2)}</td>
						<td class="border px-1 py-[3px] text-right">{num(h.E, 2)}</td>
						<td class="border px-1 py-[3px] text-right">{num(h.F, 2)}</td>
						<td class="border px-1 py-[3px] text-right">{num(h.G, 2)}</td>
						<td class="border px-1 py-[3px] text-right">{num(h.H, 2)}</td>
						<td class="border px-1 py-[3px]">{KUADRAN[h.kuadran].label}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>

	<footer class="mt-8 text-center text-xs text-muted-foreground">
		Pemerintah Provinsi Sulawesi Barat — Sulbar Maju dan Sejahtera
	</footer>
</div>
