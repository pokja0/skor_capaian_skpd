/**
 * ekspor.js — Unduh hasil ke XLSX dan PDF.
 * Keduanya dijalankan di sisi peramban (aplikasi ini statis).
 *
 * PDF dibuat secara programatik dengan jsPDF + jspdf-autotable sehingga
 * teksnya ASLI (vektor) — bisa dicari, diseleksi, dan berkasnya kecil.
 */

import { KUADRAN, KATEGORI_URUT } from '#lib/skoring.js';
import { num } from '#lib/utils.js';

// ---------------------------------------------------------------------------
// XLSX
// ---------------------------------------------------------------------------
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

export async function unduhXlsx(hasil) {
	const { default: writeXlsxFile } = await import('write-excel-file/browser');
	const header = KOLOM.map((t) => ({
		value: t,
		fontWeight: 'bold',
		backgroundColor: '#17365D',
		textColor: '#FFFFFF'
	}));
	const body = barisData(hasil).map((row) => row.map((v) => ({ value: v })));
	await writeXlsxFile([header, ...body]).toFile('skor_kinerja_skpd.xlsx');
}

// ---------------------------------------------------------------------------
// PDF (teks vektor)
// ---------------------------------------------------------------------------
const NAVY = [23, 54, 93];
const MUTED = [91, 107, 124];
const INK = [51, 71, 91];

/** Mengubah logo SVG menjadi PNG agar bisa disisipkan ke PDF. */
async function logoKePng() {
	const img = new Image();
	img.src = '/lambang-sulbar.svg';
	await new Promise((res, rej) => {
		img.onload = res;
		img.onerror = rej;
	});
	const tinggi = 256;
	const lebar = Math.max(1, Math.round(tinggi * (img.naturalWidth / img.naturalHeight) || tinggi));
	const c = document.createElement('canvas');
	c.width = lebar;
	c.height = tinggi;
	const ctx = c.getContext('2d');
	ctx.drawImage(img, 0, 0, lebar, tinggi);
	return { data: c.toDataURL('image/png'), rasio: lebar / tinggi };
}

const f = (v) => num(v, 2);

/**
 * Membuat & mengunduh laporan PDF (teks asli).
 * @param {{hasil: any[], ringkas: any, xBar: number, yBar: number}} opsi
 */
export async function unduhPdf({ hasil, ringkas, xBar, yBar }) {
	const [{ jsPDF }, { default: autoTable }] = await Promise.all([
		import('jspdf'),
		import('jspdf-autotable')
	]);

	const urut = [...hasil].sort((a, b) => a.peringkat - b.peringkat);
	const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
	const W = doc.internal.pageSize.getWidth();

	// ---- Kop ----
	let logo = null;
	try {
		logo = await logoKePng();
	} catch {
		logo = null;
	}
	if (logo) {
		const h = 15;
		doc.addImage(logo.data, 'PNG', 12, 11, h * logo.rasio, h);
	}
	const tx = logo ? 12 + 15 * logo.rasio + 5 : 12;

	doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...MUTED);
	doc.text('PEMERINTAH PROVINSI SULAWESI BARAT', tx, 15);
	doc.setFont('helvetica', 'bold').setFontSize(16).setTextColor(...NAVY);
	doc.text('Penilaian Kinerja SKPD', tx, 23);
	doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(...MUTED);
	doc.text('Capaian Kinerja Triwulan III', tx, 29);
	doc.setFont('helvetica', 'italic').setFontSize(9).setTextColor(...NAVY);
	doc.text('"Sulbar Maju dan Sejahtera"', tx, 35);

	doc.setDrawColor(...NAVY).setLineWidth(0.6).line(12, 39, W - 12, 39);

	// ---- Ringkasan ----
	let y = 46;
	doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(...NAVY);
	doc.text('Ringkasan', 12, y);
	y += 5.5;
	doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...INK);
	doc.text(`SKPD dinilai: ${ringkas.jumlah}`, 12, y);
	doc.text(`Rata-rata: ${f(ringkas.skorRata)}`, 62, y);
	doc.text(`Median: ${f(ringkas.skorMedian)}`, 104, y);
	doc.text(`Rentang: ${f(ringkas.skorMin)} s.d. ${f(ringkas.skorMax)}`, 142, y);
	y += 5.5;
	doc.text(
		'Kategori: ' +
			KATEGORI_URUT.map((k) => `${k} ${ringkas.kategori[k] ?? 0}`).join('   ·   '),
		12,
		y
	);
	y += 5.5;
	doc.text(`Garis kuadran (Kinerja vs Anggaran): capaian ${f(yBar)}% · penyerapan ${f(xBar)}%`, 12, y);
	y += 5.5;

	const hidup = hasil.filter((h) => h.skor > 0);
	const rata = (k) => hidup.reduce((a, h) => a + h[k], 0) / hidup.length;
	doc.text(
		`Rata-rata dimensi (SKPD berskor > 0): Hasil ${f(rata('d1'))} · Eksekusi ${f(rata('d2'))} · Kapasitas ${f(rata('d3'))}`,
		12,
		y
	);
	y += 5.5;
	doc.setTextColor(...MUTED).setFontSize(8);
	doc.text(`Dokumen dibuat: ${new Date().toLocaleString('id-ID')} WITA · sumber: data/Capaian OPD.xlsx`, 12, y);

	// ---- Tabel utama ----
	autoTable(doc, {
		startY: y + 4,
		head: [['#', 'SKPD', 'Skor', 'Kategori', 'Hasil', 'Eksekusi', 'Kapasitas']],
		body: urut.map((h) => [
			Math.round(h.peringkat),
			h.skpd,
			f(h.skor),
			h.kategori,
			f(h.d1),
			f(h.d2),
			f(h.d3)
		]),
		styles: { fontSize: 8, cellPadding: 1.4, overflow: 'linebreak', textColor: INK },
		headStyles: { fillColor: NAVY, textColor: 255, fontSize: 8, halign: 'left' },
		alternateRowStyles: { fillColor: [244, 247, 251] },
		columnStyles: {
			0: { halign: 'center', cellWidth: 9 },
			2: { halign: 'right', cellWidth: 15 },
			3: { cellWidth: 23 },
			4: { halign: 'right', cellWidth: 16 },
			5: { halign: 'right', cellWidth: 18 },
			6: { halign: 'right', cellWidth: 20 }
		}
	});

	// ---- Lampiran (halaman lanskap) ----
	doc.addPage('a4', 'landscape');
	const LW = doc.internal.pageSize.getWidth();
	doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(...NAVY);
	doc.text('Lampiran - Data Lengkap', 12, 14);
	doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...MUTED);
	doc.text(
		`Skor dimensi (0-100) dan nilai indikator asli. Garis kuadran: capaian ${f(yBar)}% · penyerapan ${f(xBar)}%.`,
		12,
		19
	);

	autoTable(doc, {
		startY: 23,
		head: [
			[
				'#',
				'SKPD',
				'Skor',
				'Kategori',
				'Hasil',
				'Eksekusi',
				'Kapasitas',
				'Capaian %',
				'Keuangan %',
				'Inovasi',
				'KPD',
				'SPBE',
				'SAKIP',
				'Kuadran'
			]
		],
		body: urut.map((h) => [
			Math.round(h.peringkat),
			h.skpd,
			f(h.skor),
			h.kategori,
			f(h.d1),
			f(h.d2),
			f(h.d3),
			f(h.capaian),
			f(h.keuangan),
			f(h.E),
			f(h.F),
			f(h.G),
			f(h.H),
			KUADRAN[h.kuadran]?.label ?? ''
		]),
		styles: { fontSize: 7, cellPadding: 1.1, overflow: 'linebreak', textColor: INK },
		headStyles: { fillColor: NAVY, textColor: 255, fontSize: 7 },
		alternateRowStyles: { fillColor: [244, 247, 251] },
		columnStyles: {
			0: { halign: 'center', cellWidth: 9 },
			2: { halign: 'right', cellWidth: 14 },
			3: { cellWidth: 20 },
			4: { halign: 'right', cellWidth: 14 },
			5: { halign: 'right', cellWidth: 16 },
			6: { halign: 'right', cellWidth: 18 },
			7: { halign: 'right', cellWidth: 18 },
			8: { halign: 'right', cellWidth: 20 },
			9: { halign: 'right', cellWidth: 15 },
			10: { halign: 'right', cellWidth: 13 },
			11: { halign: 'right', cellWidth: 13 },
			12: { halign: 'right', cellWidth: 14 },
			13: { cellWidth: 22 }
		}
	});

	// ---- Kaki halaman ----
	const total = doc.getNumberOfPages();
	for (let p = 1; p <= total; p++) {
		doc.setPage(p);
		const pw = doc.internal.pageSize.getWidth();
		const ph = doc.internal.pageSize.getHeight();
		doc.setFont('helvetica', 'normal').setFontSize(7).setTextColor(...MUTED);
		doc.text('Pemerintah Provinsi Sulawesi Barat - Sulbar Maju dan Sejahtera', 12, ph - 7);
		doc.text(`Halaman ${p} / ${total}`, pw - 12, ph - 7, { align: 'right' });
	}

	doc.save('laporan_kinerja_skpd.pdf');
}
