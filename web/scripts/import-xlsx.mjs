#!/usr/bin/env bun
/**
 * import-xlsx.mjs — Mengambil data dari Google Sheet lalu menulis src/lib/data.json.
 *
 * Sheet yang dibaca:
 *   1. "Capaian Triwulan III"      → data 10 indikator per SKPD
 *   2. "Data Evaluasi"             → tren indikator 2020–2026
 *   3. "Komponen SAKIP dan RB"     → rincian komponen SAKIP & RB
 *   4. "Rincian Perbandingan SPM"  → SPM per urusan 2025 vs 2026
 *
 * Alur: unduh ekspor XLSX (simpan snapshot) → parse → data.json.
 * Jalankan: bun run import:data
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const SNAPSHOT = resolve(ROOT, 'data/snapshot.xlsx');
const OUT_PATH = resolve(__dirname, '../src/lib/data.json');

const SHEET_ID = '1fPM5xEJISmnK8SrWN6LBkVzs1qBzF5m9';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=xlsx`;

const KOLOM = {
	no: 1, skpd: 2, capaian: 3, keuangan: 4, inovasi: 5, ikpd: 6,
	spbe: 7, sakip: 8, pekpp: 9, spm: 10, evmcsp: 11, evspi: 12
};

// ---------------------------------------------------------------------------
// 1. Ambil berkas
// ---------------------------------------------------------------------------
async function ambilBerkas() {
	try {
		const res = await fetch(SHEET_URL, { redirect: 'follow' });
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const buf = Buffer.from(await res.arrayBuffer());
		if (buf.length < 1000) throw new Error('berkas terlalu kecil / bukan XLSX');
		mkdirSync(dirname(SNAPSHOT), { recursive: true });
		writeFileSync(SNAPSHOT, buf);
		console.log(`Google Sheet terunduh (${buf.length} byte) → data/snapshot.xlsx`);
		return { buf, sumber: 'google-sheet' };
	} catch (e) {
		console.warn(`Gagal mengunduh Google Sheet: ${e.message}`);
		try {
			const buf = readFileSync(SNAPSHOT);
			console.warn(`Memakai snapshot terakhir (${buf.length} byte).`);
			return { buf, sumber: 'snapshot' };
		} catch {
			throw new Error('Tidak ada data: unduhan gagal dan snapshot tidak tersedia.');
		}
	}
}

// ---------------------------------------------------------------------------
// 2. ZIP + XML
// ---------------------------------------------------------------------------
function unzip(buf) {
	let eocd = -1;
	for (let i = buf.length - 22; i >= 0; i--) {
		if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
	}
	if (eocd < 0) throw new Error('Berkas bukan XLSX yang valid.');

	const jumlah = buf.readUInt16LE(eocd + 10);
	let off = buf.readUInt32LE(eocd + 16);
	const berkas = {};
	for (let n = 0; n < jumlah; n++) {
		if (buf.readUInt32LE(off) !== 0x02014b50) throw new Error('Central directory rusak.');
		const metode = buf.readUInt16LE(off + 10);
		const ukuran = buf.readUInt32LE(off + 20);
		const panjangNama = buf.readUInt16LE(off + 28);
		const panjangExtra = buf.readUInt16LE(off + 30);
		const panjangKomentar = buf.readUInt16LE(off + 32);
		const offsetLokal = buf.readUInt32LE(off + 42);
		const nama = buf.toString('utf8', off + 46, off + 46 + panjangNama);
		const nl = buf.readUInt16LE(offsetLokal + 26);
		const el = buf.readUInt16LE(offsetLokal + 28);
		const mulai = offsetLokal + 30 + nl + el;
		const mentah = buf.subarray(mulai, mulai + ukuran);
		berkas[nama] = metode === 0 ? mentah : inflateRawSync(mentah);
		off += 46 + panjangNama + panjangExtra + panjangKomentar;
	}
	return berkas;
}

const decodeXml = (s) =>
	s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
		.replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
		.replace(/&amp;/g, '&');

function parseSharedStrings(xml) {
	const out = [];
	const re = /<si\b[^>]*\/>|<si\b[^>]*>([\s\S]*?)<\/si>/g;
	let m;
	while ((m = re.exec(xml))) {
		if (m[1] === undefined) { out.push(''); continue; }
		out.push([...m[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((x) => decodeXml(x[1])).join(''));
	}
	return out;
}

const kolomKeAngka = (ref) => {
	let c = 0;
	for (const ch of /^([A-Z]+)/.exec(ref)[1]) c = c * 26 + (ch.charCodeAt(0) - 64);
	return c;
};

/** Baris → array 2D (null untuk sel kosong). */
function parseSheetArray(xml, strings) {
	const rows = [];
	const rowRe = /<row\b[^>]*>([\s\S]*?)<\/row>/g;
	let rm;
	while ((rm = rowRe.exec(xml))) {
		const sel = {};
		const cellRe = /<c\b([^>]*?)\/>|<c\b([^>]*?)>([\s\S]*?)<\/c>/g;
		let cm;
		while ((cm = cellRe.exec(rm[1]))) {
			const attrs = cm[1] ?? cm[2] ?? '';
			const isi = cm[3] ?? '';
			const r = /r="([A-Z]+\d+)"/.exec(attrs);
			if (!r) continue;
			const t = /t="([^"]+)"/.exec(attrs);
			const v = /<v\b[^>]*>([\s\S]*?)<\/v>/.exec(isi);
			const inline = /<is\b[^>]*>([\s\S]*?)<\/is>/.exec(isi);
			let nilai = null;
			if (t && t[1] === 's' && v) nilai = strings[Number(v[1])];
			else if (t && t[1] === 'inlineStr' && inline)
				nilai = [...inline[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((x) => decodeXml(x[1])).join('');
			else if (v) nilai = Number(v[1]);
			if (nilai === '') nilai = null;
			sel[kolomKeAngka(r[1])] = nilai;
		}
		const maks = Math.max(0, ...Object.keys(sel).map(Number));
		const arr = [];
		for (let c = 1; c <= maks; c++) arr.push(sel[c] ?? null);
		rows.push(arr);
	}
	return rows;
}

/** Nilai sel → angka (dukungan "22,32" & "89.24%"). */
function keAngka(v) {
	if (typeof v === 'number') return v;
	if (typeof v !== 'string') return null;
	const s = v.trim().replace('%', '').replace(/\./g, '').replace(',', '.');
	const n = Number(s);
	return Number.isFinite(n) ? n : null;
}

// ---------------------------------------------------------------------------
// 3. Susun data
// ---------------------------------------------------------------------------
function utama(rows) {
	const skpd = [];
	for (const r of rows) {
		if (typeof r[0] !== 'number') continue;
		if (typeof r[1] !== 'string') continue;
		const rec = { no: Math.trunc(r[0]), skpd: r[1].trim() };
		for (const [k, c] of Object.entries(KOLOM)) {
			if (k === 'no' || k === 'skpd') continue;
			const v = r[c - 1];
			rec[k] = typeof v === 'number' && Number.isFinite(v) ? v : null;
		}
		skpd.push(rec);
	}
	return skpd;
}

function evaluasi(rows) {
	// baris 0: No | Indikator | 2020..2026
	const tahun = (rows[0] || []).slice(2).map((v) => (typeof v === 'number' ? v : keAngka(v))).filter((v) => v);
	const baris = [];
	for (const r of rows.slice(1)) {
		if (!r || !r[1]) continue;
		const nilai = tahun.map((_, i) => keAngka(r[2 + i]));
		if (nilai.every((v) => v === null)) continue;
		baris.push({ nama: String(r[1]).trim(), nilai });
	}
	return { tahun, baris };
}

function main() {
	return ambilBerkas().then(({ buf, sumber }) => {
		const berkas = unzip(buf);
		const strings = parseSharedStrings(berkas['xl/sharedStrings.xml']?.toString('utf8') ?? '');
		const ambil = (n) => {
			const xml = berkas[`xl/worksheets/sheet${n}.xml`];
			return xml ? parseSheetArray(xml.toString('utf8'), strings) : [];
		};

		const skpd = utama(ambil(1));
		if (!skpd.length) throw new Error('Tidak ada baris data pada sheet utama.');

		const data = {
			sumber: 'Google Sheet (Capaian OPD)',
			sumberDetail: sumber,
			sheetId: SHEET_ID,
			diimpor: new Date().toISOString(),
			jumlah: skpd.length,
			skpd,
			ringkasan: {
				evaluasi: evaluasi(ambil(2)),
				sakipRb: ambil(3).filter((r) => r && r.some((v) => v !== null)),
				spm: ambil(4).filter((r) => r && r.some((v) => v !== null))
			}
		};

		mkdirSync(dirname(OUT_PATH), { recursive: true });
		writeFileSync(OUT_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');

		const terisi = (k) => skpd.filter((s) => s[k] !== null).length;
		console.log(`Impor selesai: ${skpd.length} SKPD (${sumber})`);
		for (const k of Object.keys(KOLOM).slice(2)) console.log(`  ${k.padEnd(9)} terisi ${terisi(k)}/${skpd.length}`);
		console.log(`  evaluasi : ${data.ringkasan.evaluasi.baris.length} baris, ${data.ringkasan.evaluasi.tahun.length} tahun`);
		console.log(`  sakipRb  : ${data.ringkasan.sakipRb.length} baris`);
		console.log(`  spm      : ${data.ringkasan.spm.length} baris`);
	});
}

main().catch((e) => {
	console.error('GAGAL:', e.message);
	process.exit(1);
});
