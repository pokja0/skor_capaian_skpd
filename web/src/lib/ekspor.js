/**
 * ekspor.js — Unduh hasil ke XLSX dan cetak ke PDF.
 * Keduanya dijalankan di sisi peramban (aplikasi ini statis).
 */

import { KUADRAN } from '#lib/skoring.js';

/** Header kolom untuk berkas XLSX */
const KOLOM = [
	'Peringkat',
	'SKPD',
	'Skor Akhir',
	'Kategori',
	'Skor Dimensi: Hasil',
	'Skor Dimensi: Eksekusi',
	'Skor Dimensi: Kapasitas',
	'Kuadran (Kinerja vs Anggaran)',
	'Asli: Capaian Kinerja (%)',
	'Asli: Realisasi Keuangan (%)',
	'Asli: Indeks Kematangan Inovasi',
	'Asli: Indeks Kematangan Perangkat Daerah',
	'Asli: Indeks SPBE (TW II)',
	'Asli: Nilai SAKIP (2025)'
];

function barisData(hasil) {
	const urut = [...hasil].sort((a, b) => a.peringkat - b.peringkat);
	return urut.map((h) => [
		Math.round(h.peringkat),
		h.skpd,
		Number(h.skor.toFixed(2)),
		h.kategori,
		Number(h.d1.toFixed(2)),
		Number(h.d2.toFixed(2)),
		Number(h.d3.toFixed(2)),
		KUADRAN[h.kuadran]?.label ?? '',
		h.capaian,
		h.keuangan,
		h.E,
		h.F,
		h.G,
		h.H
	]);
}

/** Unduh XLSX (dimuat saat diklik agar tidak mengganggu render server). */
export async function unduhXlsx(hasil) {
	const { default: writeXlsxFile } = await import('write-excel-file/browser');
	const header = KOLOM.map((t) => ({
		value: t,
		fontWeight: 'bold',
		backgroundColor: '#17365D',
		textColor: '#FFFFFF'
	}));
	const body = barisData(hasil).map((row) => row.map((v) => ({ value: v })));
	// v4: fungsi mengembalikan objek dengan metode toFile()/toBlob()
	await writeXlsxFile([header, ...body]).toFile('skor_kinerja_skpd.xlsx');
}

/** Cetak / simpan sebagai PDF memakai dialog cetak peramban (teks tetap tajam). */
export function cetakPdf() {
	if (typeof window !== 'undefined') window.print();
}
