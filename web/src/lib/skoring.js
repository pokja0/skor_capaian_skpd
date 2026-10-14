/**
 * skoring.js — Mesin penilaian kinerja SKPD (port dari skoring.py yang tervalidasi).
 *
 * Metode utama:
 *   Normalisasi ABSOLUT berbasis target → 3 dimensi → agregasi GEOMETRIK (non-kompensatoris).
 *
 * Angka acuan (harus sama dengan versi Python):
 *   Dinas Tanaman Pangan = 78,84 ; enam SKPD bercapaian 0 = skor 0.
 */

// --- Definisi indikator & dimensi -----------------------------------------
export const INDIKATOR = [
	{ key: 'capaian', label: 'Capaian Kinerja TW III', unit: '%', dimensi: 'D1', peran: 'Hasil (output/outcome)' },
	{ key: 'keuangan', label: 'Realisasi Keuangan TW III', unit: '%', dimensi: 'D2', peran: 'Eksekusi anggaran' },
	{ key: 'E', label: 'Indeks Kematangan Inovasi', unit: 'poin', dimensi: 'D3', peran: 'Kapasitas' },
	{ key: 'F', label: 'Indeks Kematangan Perangkat Daerah', unit: 'poin', dimensi: 'D3', peran: 'Kapasitas' },
	{ key: 'G', label: 'Indeks SPBE (TW II)', unit: 'poin 0–5', dimensi: 'D3', peran: 'Kapasitas' },
	{ key: 'H', label: 'Nilai SAKIP (2025)', unit: 'poin 0–100', dimensi: 'D3', peran: 'Kapasitas' }
];

export const DIMENSI = [
	{ kode: 'D1', nama: 'Hasil Kinerja', keys: ['capaian'], warna: 'var(--dim-hasil)' },
	{ kode: 'D2', nama: 'Eksekusi Anggaran', keys: ['keuangan'], warna: 'var(--dim-eksekusi)' },
	{ kode: 'D3', nama: 'Kapasitas & Tata Kelola', keys: ['E', 'F', 'G', 'H'], warna: 'var(--dim-kapasitas)' }
];

export const KATEGORI_URUT = ['Sangat Baik', 'Baik', 'Cukup', 'Kurang', 'Capaian 0'];

export const KATEGORI_WARNA = {
	'Sangat Baik': 'var(--kat-sangat-baik)',
	Baik: 'var(--kat-baik)',
	Cukup: 'var(--kat-cukup)',
	Kurang: 'var(--kat-kurang)',
	'Capaian 0': 'var(--kat-nol)'
};

// --- Normalisasi absolut berbasis target ----------------------------------
export function normAbsolut(key, v) {
	if (key === 'capaian') return Math.min(v, 110); // target 100%, dipotong di 110
	if (key === 'keuangan') return Math.min(v, 100); // target 100%
	if (key === 'G') return (v / 5) * 100; // SPBE 0–5 → 0–100 (penyetaraan satuan)
	return v; // E, F, H dipakai apa adanya
}

function rata(arr) {
	return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// --- Peringkat (seri memakai rata-rata posisi) ----------------------------
export function beriPeringkat(skorArr) {
	const n = skorArr.length;
	const idx = Array.from({ length: n }, (_, i) => i).sort(
		(a, b) => skorArr[b] - skorArr[a] || a - b
	);
	const rank = new Array(n);
	let i = 0;
	while (i < n) {
		let j = i;
		while (j + 1 < n && skorArr[idx[j + 1]] === skorArr[idx[i]]) j++;
		const avg = (i + j) / 2 + 1;
		for (let k = i; k <= j; k++) rank[idx[k]] = avg;
		i = j + 1;
	}
	return rank;
}

export function kategoriDari(skor, capaianNol) {
	if (capaianNol) return 'Capaian 0';
	if (skor >= 70) return 'Sangat Baik';
	if (skor >= 60) return 'Baik';
	if (skor >= 45) return 'Cukup';
	return 'Kurang';
}

// --- Hitung seluruh skor ---------------------------------------------------
export function hitungSkor(records) {
	const dasar = records.map((r) => {
		const s = {};
		for (const ind of INDIKATOR) s[ind.key] = normAbsolut(ind.key, r[ind.key]);
		const d1 = s.capaian;
		const d2 = s.keuangan;
		const d3 = rata([s.E, s.F, s.G, s.H]);
		const skor = d1 <= 0 || d2 <= 0 || d3 <= 0 ? 0 : Math.cbrt(d1 * d2 * d3);
		return {
			...r,
			s: {
				capaian: s.capaian,
				keuangan: s.keuangan,
				E: s.E,
				F: s.F,
				G: s.G,
				H: s.H
			},
			d1,
			d2,
			d3,
			skor
		};
	});

	const peringkat = beriPeringkat(dasar.map((d) => d.skor));
	const hasil = dasar.map((d, i) => {
		const capaianNol = d.capaian === 0;
		return {
			...d,
			peringkat: peringkat[i],
			kategori: kategoriDari(d.skor, capaianNol),
			capaianNol,
			seri: peringkat.filter((p) => p === peringkat[i]).length > 1
		};
	});
	return hasil;
}

// --- Ringkasan & statistik -------------------------------------------------
export function ringkas(hasil) {
	const skor = hasil.map((h) => h.skor);
	const terurut = [...skor].sort((a, b) => a - b);
	const n = terurut.length;
	const median = n % 2 ? terurut[(n - 1) / 2] : (terurut[n / 2 - 1] + terurut[n / 2]) / 2;
	const kategori = {};
	for (const k of KATEGORI_URUT) kategori[k] = 0;
	for (const h of hasil) kategori[h.kategori]++;

	const juara = [...hasil].sort((a, b) => b.skor - a.skor)[0];
	return {
		jumlah: n,
		skorMax: Math.max(...skor),
		skorMin: Math.min(...skor),
		skorMedian: median,
		skorRata: rata(skor),
		juara,
		kategori,
		baik: (kategori['Sangat Baik'] || 0) + (kategori['Baik'] || 0),
		perhatian: (kategori['Kurang'] || 0) + (kategori['Capaian 0'] || 0)
	};
}

// --- Nama pendek untuk tabel ----------------------------------------------
const PENDEK = [
	[/^Dinas Komunikasi.*/, 'Dinas Kominfo & Statistik'],
	[/^Dinas Koperasi.*/, 'Dinas Koperasi & UKM'],
	[/^Dinas Penanaman Modal.*/, 'Dinas Penanaman Modal (PTSP)'],
	[/^Dinas Kepemudaan.*/, 'Dinas Pariwisata & Ekraf'],
	[/^Dinas Pekerjaan Umum.*/, 'Dinas PU & Penataan Ruang'],
	[/^Dinas Perumahan.*/, 'Dinas Perumahan & Permukiman'],
	[/^Dinas Sosial.*/, 'Dinas Sosial & PMD'],
	[/^Dinas Tanaman Pangan.*/, 'Dinas Pertanian & Peternakan'],
	[/^Badan Perencanaan Pembangunan.*/, 'Bappeda'],
	[/^Badan Pengelolaan Keuangan dan Aset.*/, 'BPKAD'],
	[/^Badan Kepegawaian.*/, 'BKPSDM'],
	[/^Badan Kesatuan Bangsa.*/, 'Badan Kesbangpol'],
	[/^Badan Pendapatan.*/, 'Badan Pendapatan Daerah'],
	[/^Badan Penghubung.*/, 'Badan Penghubung'],
	[/^Badan Penanggulangan Bencana.*/, 'BPBD'],
	[/^Dinas Kependudukan.*/, 'Dinas Dukcapil'],
	[/^Sekretariat Dewan Perwakilan Rakyat.*/, 'Sekretariat DPRD'],
	[/^Dinas Lingkungan Hidup.*/, 'Dinas Lingkungan Hidup & Kehutanan'],
	[/^Dinas Transmigrasi.*/, 'Dinas Transmigrasi & Tenaga Kerja'],
	[/^Dinas Kelautan.*/, 'Dinas Kelautan & Perikanan'],
	[/^Dinas Perpustakaan.*/, 'Dinas Perpustakaan & Kearsipan'],
	[/^Dinas Energi.*/, 'Dinas ESDM'],
	[/^Dinas Pendidikan.*/, 'Dinas Pendidikan & Kebudayaan'],
	[/^Dinas Kesehatan.*/, 'Dinas Kesehatan'],
	[/^Biro Pemerintahan.*/, 'Biro Pemerintahan & Kesra'],
	[/^Biro Perekonomian.*/, 'Biro Perekonomian & Adpem'],
	[/^Biro Pengadaan.*/, 'Biro Pengadaan Barang & Jasa'],
	[/ Daerah$/, '']
];

export function namaPendek(nama) {
	let s = nama;
	for (const [re, ganti] of PENDEK) s = s.replace(re, ganti);
	return s.trim();
}

export function tipeSKPD(nama) {
	const n = nama.toLowerCase();
	if (n.startsWith('rumah sakit')) return 'RSUD';
	if (n.startsWith('satuan polisi')) return 'Satpol PP';
	if (n.startsWith('biro')) return 'Biro';
	if (n.startsWith('badan') || n.startsWith('sekretariat') || n.startsWith('inspektorat'))
		return 'Badan/Lembaga';
	if (n.startsWith('dinas')) return 'Dinas';
	return 'Lainnya';
}

// --- Kuadran Kinerja vs Anggaran ------------------------------------------
export const KUADRAN = {
	kananAtas: { label: 'Optimal', ket: 'Capaian & serapan tinggi', warna: 'var(--dim-eksekusi)' },
	kananBawah: { label: 'Telusuri', ket: 'Serapan tinggi, capaian rendah', warna: 'var(--kat-kurang)' },
	kiriAtas: { label: 'Efisien', ket: 'Capaian tinggi, serapan hemat', warna: 'var(--dim-hasil)' },
	kiriBawah: { label: 'Perlu perhatian', ket: 'Capaian & serapan rendah', warna: 'var(--kat-cukup)' }
};

export const KUADRAN_URUT = ['kananAtas', 'kananBawah', 'kiriAtas', 'kiriBawah'];

/**
 * Menandai tiap SKPD dengan kuadran Kinerja (capaian) vs Anggaran (realisasi keuangan),
 * dipisahkan oleh garis rata-rata. Kembalikan hasil + nilai rata-rata kedua sumbu.
 */
export function beriKuadran(hasil) {
	const rerata = (k) => hasil.reduce((a, h) => a + h[k], 0) / hasil.length;
	const xBar = rerata('keuangan');
	const yBar = rerata('capaian');
	const ditandai = hasil.map((h) => {
		const kanan = h.keuangan > xBar;
		const atas = h.capaian > yBar;
		const kuadran = kanan && atas ? 'kananAtas' : kanan ? 'kananBawah' : atas ? 'kiriAtas' : 'kiriBawah';
		return { ...h, kuadran };
	});
	return { hasil: ditandai, xBar, yBar };
}
