/**
 * ekspor.js — Unduh hasil ke XLSX dan PDF (teks vektor).
 */

import { KUADRAN, KATEGORI_URUT, INDIKATOR } from '#lib/skoring.js';
import { num } from '#lib/utils.js';

const f = (v) => num(v, 2);

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
	'Skor Dimensi: Kapasitas & Kepatuhan',
	'Cakupan Data (dari 10)',
	'Kuadran (Kinerja vs Anggaran)',
	...INDIKATOR.map((i) => `Asli: ${i.label}${i.unit ? ` (${i.unit})` : ''}`)
];

function barisData(hasil) {
	const urut = [...hasil].sort((a, b) => a.peringkat - b.peringkat);
	return urut.map((h) => [
		Math.round(h.peringkat),
		h.skpd,
		Number(h.skor.toFixed(2)),
		h.kategori,
		h.d1 === null ? null : Number(h.d1.toFixed(2)),
		h.d2 === null ? null : Number(h.d2.toFixed(2)),
		h.d3 === null ? null : Number(h.d3.toFixed(2)),
		h.cakupan,
		KUADRAN[h.kuadran]?.label ?? '',
		...INDIKATOR.map((i) => h[i.key])
	]);
}

export async function unduhXlsx(hasil) {
	const { default: writeXlsxFile } = await import('write-excel-file/browser');
	const header = KOLOM.map((t) => ({
		value: t,
		fontWeight: 'bold',
		backgroundColor: '#0B2340',
		textColor: '#FFFFFF'
	}));
	const body = barisData(hasil).map((row) => row.map((v) => ({ value: v })));
	await writeXlsxFile([header, ...body]).toFile('skor_kinerja_skpd.xlsx');
}

// ---------------------------------------------------------------------------
// PDF (teks vektor)
// ---------------------------------------------------------------------------
const NAVY = [11, 35, 64];
const MUTED = [100, 116, 139];
const INK = [51, 71, 91];

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
	c.getContext('2d').drawImage(img, 0, 0, lebar, tinggi);
	return { data: c.toDataURL('image/png'), rasio: lebar / tinggi };
}

export async function unduhPdf({ hasil, ringkas, xBar, yBar }) {
	const [{ jsPDF }, { default: autoTable }] = await Promise.all([
		import('jspdf'),
		import('jspdf-autotable')
	]);

	const urut = [...hasil].sort((a, b) => a.peringkat - b.peringkat);
	const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
	const W = doc.internal.pageSize.getWidth();

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
	doc.text('Kategori: ' + KATEGORI_URUT.map((k) => `${k} ${ringkas.kategori[k] ?? 0}`).join('   ·   '), 12, y);
	y += 5.5;
	doc.text(`Garis kuadran: capaian ${f(yBar)}% · penyerapan ${f(xBar)}%`, 12, y);
	y += 5.5;

	const hidup = hasil.filter((h) => h.skor > 0);
	const rata = (k) => {
		const v = hidup.map((h) => h[k]).filter((x) => x !== null && x !== undefined);
		return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
	};
	doc.text(
		`Rata-rata dimensi: Hasil ${f(rata('d1'))} · Eksekusi ${f(rata('d2'))} · Kapasitas ${f(rata('d3'))}`,
		12,
		y
	);
	y += 5.5;
	doc.setTextColor(...MUTED).setFontSize(8);
	doc.text(
		`Dokumen dibuat: ${new Date().toLocaleString('id-ID')} · 10 indikator · 3 dimensi · sumber: Google Sheet Capaian OPD`,
		12,
		y
	);

	// Tabel utama
	autoTable(doc, {
		startY: y + 4,
		head: [['#', 'SKPD', 'Skor', 'Kategori', 'Hasil', 'Eksekusi', 'Kapasitas', 'Cakupan']],
		body: urut.map((h) => [
			Math.round(h.peringkat),
			h.skpd,
			f(h.skor),
			h.kategori,
			h.d1 === null ? '-' : f(h.d1),
			h.d2 === null ? '-' : f(h.d2),
			h.d3 === null ? '-' : f(h.d3),
			`${h.cakupan}/10`
		]),
		styles: { fontSize: 8, cellPadding: 1.4, overflow: 'linebreak', textColor: INK },
		headStyles: { fillColor: NAVY, textColor: 255, fontSize: 8 },
		alternateRowStyles: { fillColor: [244, 247, 251] },
		columnStyles: {
			0: { halign: 'center', cellWidth: 9 },
			2: { halign: 'right', cellWidth: 14 },
			3: { cellWidth: 22 },
			4: { halign: 'right', cellWidth: 15 },
			5: { halign: 'right', cellWidth: 17 },
			6: { halign: 'right', cellWidth: 19 },
			7: { halign: 'center', cellWidth: 16 }
		}
	});

	// Lampiran lanskap
	doc.addPage('a4', 'landscape');
	const LW = doc.internal.pageSize.getWidth();
	doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(...NAVY);
	doc.text('Lampiran - Data Lengkap', 12, 14);
	doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...MUTED);
	doc.text(
		`Skor dimensi (0-100) dan nilai indikator asli. Tanda "-" berarti tidak dinilai (tidak diikutkan dalam skor). Garis kuadran: capaian ${f(yBar)}% · penyerapan ${f(xBar)}%.`,
		12,
		19
	);

	const head = [
		['#', 'SKPD', 'Skor', 'Kategori', 'Hasil', 'Eksekusi', 'Kapasitas',
		 ...INDIKATOR.map((i) => i.singkat), 'Kuadran']
	];
	const body = urut.map((h) => [
		Math.round(h.peringkat),
		h.skpd,
		f(h.skor),
		h.kategori,
		h.d1 === null ? '-' : f(h.d1),
		h.d2 === null ? '-' : f(h.d2),
		h.d3 === null ? '-' : f(h.d3),
		...INDIKATOR.map((i) => (h[i.key] === null || h[i.key] === undefined ? '-' : num(h[i.key], 2))),
		KUADRAN[h.kuadran]?.label ?? ''
	]);

	autoTable(doc, {
		startY: 23,
		head,
		body,
		styles: { fontSize: 6.2, cellPadding: 0.9, overflow: 'linebreak', textColor: INK },
		headStyles: { fillColor: NAVY, textColor: 255, fontSize: 6.2 },
		alternateRowStyles: { fillColor: [244, 247, 251] },
		columnStyles: {
			0: { halign: 'center', cellWidth: 7 },
			1: { cellWidth: 50 },
			2: { halign: 'right', cellWidth: 11 },
			3: { cellWidth: 17 },
			4: { halign: 'right', cellWidth: 11 },
			5: { halign: 'right', cellWidth: 13 },
			6: { halign: 'right', cellWidth: 14 },
			16: { cellWidth: 18 }
		},
		margin: { left: 10, right: 10 }
	});

	const total = doc.getNumberOfPages();
	for (let p = 1; p <= total; p++) {
		doc.setPage(p);
		const pw = doc.internal.pageSize.getWidth();
		const ph = doc.internal.pageSize.getHeight();
		doc.setFont('helvetica', 'normal').setFontSize(7).setTextColor(...MUTED);
		doc.text('Pemerintah Provinsi Sulawesi Barat - Sulbar Maju dan Sejahtera', 10, ph - 7);
		doc.text(`Halaman ${p} / ${total}`, pw - 10, ph - 7, { align: 'right' });
	}

	doc.save('laporan_kinerja_skpd.pdf');
}
