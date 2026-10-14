#!/usr/bin/env bun
/**
 * import-xlsx.mjs — Membaca data/Capaian OPD.xlsx lalu menulis web/src/lib/data.json.
 *
 * Ditulis tanpa pustaka eksternal: membaca arsip XLSX (ZIP) memakai node:zlib,
 * lalu mengurai XML-nya. Jalankan dengan:  bun run import:data
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const XLSX_PATH = resolve(__dirname, '../../data/Capaian OPD.xlsx');
const OUT_PATH = resolve(__dirname, '../src/lib/data.json');

// ---------------------------------------------------------------------------
// 1. Baca arsip ZIP (format XLSX)
// ---------------------------------------------------------------------------
function unzip(buf) {
	let eocd = -1;
	for (let i = buf.length - 22; i >= 0; i--) {
		if (buf.readUInt32LE(i) === 0x06054b50) {
			eocd = i;
			break;
		}
	}
	if (eocd < 0) throw new Error('Berkas bukan XLSX yang valid (EOCD tidak ditemukan).');

	const jumlah = buf.readUInt16LE(eocd + 10);
	let off = buf.readUInt32LE(eocd + 16);
	const berkas = {};

	for (let n = 0; n < jumlah; n++) {
		if (buf.readUInt32LE(off) !== 0x02014b50) throw new Error('Central directory rusak.');
		const metode = buf.readUInt16LE(off + 10);
		const ukuranTerkompresi = buf.readUInt32LE(off + 20);
		const panjangNama = buf.readUInt16LE(off + 28);
		const panjangExtra = buf.readUInt16LE(off + 30);
		const panjangKomentar = buf.readUInt16LE(off + 32);
		const offsetLokal = buf.readUInt32LE(off + 42);
		const nama = buf.toString('utf8', off + 46, off + 46 + panjangNama);

		const panjangNamaLokal = buf.readUInt16LE(offsetLokal + 26);
		const panjangExtraLokal = buf.readUInt16LE(offsetLokal + 28);
		const mulaiData = offsetLokal + 30 + panjangNamaLokal + panjangExtraLokal;
		const mentah = buf.subarray(mulaiData, mulaiData + ukuranTerkompresi);

		berkas[nama] = metode === 0 ? mentah : inflateRawSync(mentah);
		off += 46 + panjangNama + panjangExtra + panjangKomentar;
	}
	return berkas;
}

// ---------------------------------------------------------------------------
// 2. Bantu parsing XML
// ---------------------------------------------------------------------------
function decodeXml(s) {
	return s
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
		.replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
		.replace(/&amp;/g, '&');
}

function parseSharedStrings(xml) {
	const out = [];
	const re = /<si\b[^>]*\/>|<si\b[^>]*>([\s\S]*?)<\/si>/g;
	let m;
	while ((m = re.exec(xml))) {
		if (m[1] === undefined) {
			out.push('');
			continue;
		}
		const teks = [...m[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((x) => decodeXml(x[1]));
		out.push(teks.join(''));
	}
	return out;
}

function kolomKeAngka(ref) {
	const m = /^([A-Z]+)/.exec(ref);
	let c = 0;
	for (const ch of m[1]) c = c * 26 + (ch.charCodeAt(0) - 64);
	return c;
}

function parseSheet(xml, strings) {
	const baris = [];
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
				nilai = [...inline[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)]
					.map((x) => decodeXml(x[1]))
					.join('');
			else if (v) nilai = Number(v[1]);
			sel[kolomKeAngka(r[1])] = nilai;
		}
		baris.push(sel);
	}
	return baris;
}

// ---------------------------------------------------------------------------
// 3. Bangun data
// ---------------------------------------------------------------------------
const KOLOM = { capaian: 3, keuangan: 4, E: 5, F: 6, G: 7, H: 8 };

function main() {
	const buf = readFileSync(XLSX_PATH);
	const berkas = unzip(buf);

	const sheetXml = berkas['xl/worksheets/sheet1.xml']?.toString('utf8');
	const stringsXml = berkas['xl/sharedStrings.xml']?.toString('utf8') ?? '';
	if (!sheetXml) throw new Error('Sheet1 tidak ditemukan di dalam XLSX.');

	const strings = parseSharedStrings(stringsXml);
	const baris = parseSheet(sheetXml, strings);

	const skpd = [];
	for (const sel of baris) {
		// Baris data: No numerik + nama teks + 6 nilai numerik
		if (typeof sel[1] !== 'number') continue;
		if (typeof sel[2] !== 'string') continue;
		const nilaiOk = Object.values(KOLOM).every((c) => typeof sel[c] === 'number');
		if (!nilaiOk) continue;
		const rec = { no: Math.trunc(sel[1]), skpd: sel[2].trim() };
		for (const [k, c] of Object.entries(KOLOM)) rec[k] = sel[c];
		skpd.push(rec);
	}

	if (skpd.length === 0) throw new Error('Tidak ada baris data yang terbaca.');

	const data = {
		sumber: 'data/Capaian OPD.xlsx',
		sheet: 'Capaian Triwulan III',
		diimpor: new Date().toISOString(),
		jumlah: skpd.length,
		skpd
	};

	mkdirSync(dirname(OUT_PATH), { recursive: true });
	writeFileSync(OUT_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');

	console.log(`Impor selesai: ${skpd.length} SKPD -> ${OUT_PATH}`);
	console.log('Contoh baris:', skpd[0]);
}

main();
