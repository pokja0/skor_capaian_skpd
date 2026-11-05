/**
 * skoring.js — Mesin penilaian kinerja SKPD.
 *
 * 10 indikator → 3 dimensi → agregasi geometrik antar-dimensi.
 * Nilai KOSONG (tidak dinilai) tidak diikutkan; bobot dinormalisasi ulang.
 * Nilai 0 tetap dihitung sebagai 0.
 */

// --- Indikator ------------------------------------------------------------
// `singkat` dipakai di panel rincian; `unit` untuk keterangan satuan.
export const INDIKATOR = [
	{ key: 'capaian', label: 'Capaian Kinerja TW III', singkat: 'Capaian Kinerja', unit: '%', dimensi: 'D1', peran: 'Hasil (output/outcome)' },
	{ key: 'keuangan', label: 'Realisasi Keuangan TW III', singkat: 'Realisasi Keuangan', unit: '%', dimensi: 'D2', peran: 'Realisasi anggaran' },
	{ key: 'inovasi', label: 'Indeks Kematangan Inovasi', singkat: 'Indeks Inovasi', unit: 'poin', dimensi: 'D3', peran: 'Kapasitas' },
	{ key: 'ikpd', label: 'Indeks Kematangan Perangkat Daerah', singkat: 'Kematangan PD', unit: 'poin', dimensi: 'D3', peran: 'Kapasitas' },
	{ key: 'spbe', label: 'Indeks SPBE (TW II)', singkat: 'Indeks SPBE', unit: '0–5', dimensi: 'D3', peran: 'Kapasitas' },
	{ key: 'sakip', label: 'Nilai SAKIP (2025)', singkat: 'Nilai SAKIP', unit: '0–100', dimensi: 'D3', peran: 'Kapasitas' },
	{ key: 'pekpp', label: 'PEKPP', singkat: 'PEKPP', unit: '0–5', dimensi: 'D3', peran: 'Kepatuhan' },
	{ key: 'spm', label: 'Nilai SPM', singkat: 'Nilai SPM', unit: '0–100', dimensi: 'D3', peran: 'Pelayanan' },
	{ key: 'evmcsp', label: 'Pemenuhan Evidence MCsP', singkat: 'Ev. MCsP', unit: '0–100', dimensi: 'D3', peran: 'Kepatuhan' },
	{ key: 'evspi', label: 'Pemenuhan Evidence SPI', singkat: 'Ev. SPI', unit: '0–100', dimensi: 'D3', peran: 'Kepatuhan' }
];

export const KEYS = INDIKATOR.map((i) => i.key);

export const DIMENSI = [
	{ kode: 'D1', nama: 'Capaian Kinerja', keys: ['capaian'], warna: 'var(--dim-hasil)' },
	{ kode: 'D2', nama: 'Realisasi Anggaran', keys: ['keuangan'], warna: 'var(--dim-eksekusi)' },
	{
		kode: 'D3',
		nama: 'Kapasitas & Kepatuhan',
		keys: ['inovasi', 'ikpd', 'spbe', 'sakip', 'pekpp', 'spm', 'evmcsp', 'evspi'],
		warna: 'var(--dim-kapasitas)'
	}
];

export const KATEGORI_URUT = ['Sangat Baik', 'Baik', 'Cukup', 'Kurang', 'Skor 0'];

export const KATEGORI_WARNA = {
	'Sangat Baik': 'var(--kat-sangat-baik)',
	Baik: 'var(--kat-baik)',
	Cukup: 'var(--kat-cukup)',
	Kurang: 'var(--kat-kurang)',
	'Skor 0': 'var(--kat-nol)'
};

export const CAKUPAN_MIN = 8; // dari 10 indikator; di bawah ini ditandai "data terbatas"

// --- Normalisasi absolut berbasis target ----------------------------------
export function normAbsolut(key, v) {
	if (v === null || v === undefined || Number.isNaN(v)) return null;
	if (key === 'capaian') return Math.min(v, 110);
	if (key === 'keuangan') return Math.min(v, 100);
	if (key === 'spbe' || key === 'pekpp') return (v / 5) * 100;
	return v;
}

function rataAngka(arr) {
	const v = arr.filter((x) => x !== null && x !== undefined && !Number.isNaN(x));
	return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

// --- Peringkat (seri memakai rata-rata posisi) ----------------------------
export function beriPeringkat(skorArr) {
	const n = skorArr.length;
	const idx = Array.from({ length: n }, (_, i) => i).sort((a, b) => skorArr[b] - skorArr[a] || a - b);
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

export function kategoriDari(skor) {
	if (skor === 0) return 'Skor 0';
	if (skor >= 70) return 'Sangat Baik';
	if (skor >= 60) return 'Baik';
	if (skor >= 45) return 'Cukup';
	return 'Kurang';
}

// --- Hitung seluruh skor ---------------------------------------------------
export function hitungSkor(records) {
	const dasar = records.map((r) => {
		const s = {};
		let terisi = 0;
		for (const ind of INDIKATOR) {
			s[ind.key] = normAbsolut(ind.key, r[ind.key]);
			if (r[ind.key] !== null && r[ind.key] !== undefined) terisi++;
		}

		const d1 = s.capaian;
		const d2 = s.keuangan;
		const d3 = rataAngka([s.inovasi, s.ikpd, s.spbe, s.sakip, s.pekpp, s.spm, s.evmcsp, s.evspi]);

		// Geometrik antar-dimensi; dimensi yang kosong tidak diikutkan.
		const dims = [d1, d2, d3].filter((v) => v !== null && v !== undefined);
		let skor = 0;
		if (dims.length && !dims.some((v) => v <= 0)) {
			skor = Math.exp(dims.reduce((a, v) => a + Math.log(v), 0) / dims.length);
		}

		return {
			...r,
			s,
			d1,
			d2,
			d3,
			skor,
			cakupan: terisi,
			dataTerbatas: terisi < CAKUPAN_MIN
		};
	});

	const peringkat = beriPeringkat(dasar.map((d) => d.skor));
	return dasar.map((d, i) => ({
		...d,
		peringkat: peringkat[i],
		kategori: kategoriDari(d.skor),
		capaianNol: d.capaian === 0,
		seri: peringkat.filter((p) => p === peringkat[i]).length > 1
	}));
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
	return {
		jumlah: n,
		skorMax: Math.max(...skor),
		skorMin: Math.min(...skor),
		skorMedian: median,
		skorRata: rataAngka(skor),
		juara: [...hasil].sort((a, b) => b.skor - a.skor)[0],
		kategori,
		baik: (kategori['Sangat Baik'] || 0) + (kategori['Baik'] || 0),
		perhatian: (kategori['Kurang'] || 0) + (kategori['Skor 0'] || 0)
	};
}

/** Rata-rata nilai ASLI tiap indikator (untuk penanda merah di rincian). */
export function rataIndikator(hasil) {
	const out = {};
	for (const key of KEYS) out[key] = rataAngka(hasil.map((h) => h[key]));
	return out;
}

/** Rata-rata skor tiap dimensi (untuk penanda merah di rincian). */
export function rataDimensi(hasil) {
	return {
		d1: rataAngka(hasil.map((h) => h.d1)),
		d2: rataAngka(hasil.map((h) => h.d2)),
		d3: rataAngka(hasil.map((h) => h.d3))
	};
}

export function tipeSKPD(nama) {
	const n = nama.toLowerCase();
	if (n.startsWith('rumah sakit')) return 'RSUD';
	if (n.startsWith('satuan polisi')) return 'Satpol PP';
	if (n.startsWith('biro')) return 'Biro';
	if (n.startsWith('badan') || n.startsWith('sekretariat') || n.startsWith('inspektorat')) return 'Badan/Lembaga';
	if (n.startsWith('dinas')) return 'Dinas';
	return 'Lainnya';
}

// --- Kuadran Kinerja vs Anggaran ------------------------------------------
export const KUADRAN = {
	kananAtas: { label: 'Optimal', ket: 'Capaian & serapan tinggi', warna: 'var(--dim-eksekusi)', bg: '#eef6f3' },
	kananBawah: { label: 'Telusuri', ket: 'Serapan tinggi, capaian rendah', warna: 'var(--kat-kurang)', bg: '#fdf0f1' },
	kiriAtas: { label: 'Efisien', ket: 'Capaian tinggi, serapan hemat', warna: 'var(--dim-hasil)', bg: '#eef4fb' },
	kiriBawah: { label: 'Perlu perhatian', ket: 'Capaian & serapan rendah', warna: 'var(--kat-cukup)', bg: '#fdf6ea' }
};

export const KUADRAN_URUT = ['kananAtas', 'kananBawah', 'kiriAtas', 'kiriBawah'];

export function beriKuadran(hasil) {
	const rerata = (k) => rataAngka(hasil.map((h) => h[k]));
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

export { rataAngka };
