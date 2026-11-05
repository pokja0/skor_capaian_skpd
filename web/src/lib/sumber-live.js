/**
 * sumber-live.js — Mengambil data langsung dari Google Sheet di peramban.
 *
 * Google tidak mengirim header CORS, jadi dipakai JSONP (script tag) —
 * endpoint gviz mengembalikan `callback({...})` sehingga bisa dibaca lintas domain.
 * Bila gagal/kelamaan, kembalikan null dan halaman memakai snapshot hasil build.
 */

export const SHEET_ID = '1fPM5xEJISmnK8SrWN6LBkVzs1qBzF5m9';

function angka(v) {
	return v === null || v === undefined || v === '' ? null : Number(v);
}

function teks(v) {
	return v === null || v === undefined ? '' : String(v).trim();
}

/** Ubah payload gviz menjadi daftar SKPD. */
export function parseGviz(payload) {
	const rows = payload?.table?.rows ?? [];
	const out = [];
	for (const r of rows) {
		const c = r?.c ?? [];
		const no = Number(c[0]?.v);
		const nama = teks(c[1]?.v);
		if (!Number.isFinite(no) || !nama) continue;
		out.push({
			no,
			skpd: nama,
			capaian: angka(c[2]?.v),
			keuangan: angka(c[3]?.v),
			inovasi: angka(c[4]?.v),
			ikpd: angka(c[5]?.v),
			spbe: angka(c[6]?.v),
			sakip: angka(c[7]?.v),
			pekpp: angka(c[8]?.v),
			spm: angka(c[9]?.v),
			evmcsp: angka(c[10]?.v),
			evspi: angka(c[11]?.v)
		});
	}
	return out;
}

/**
 * Ambil data live. Selalu resolve (null bila gagal) agar UI tidak menggantung.
 * @param {number} batasMs
 */
export function ambilLive(batasMs = 8000) {
	if (typeof document === 'undefined') return Promise.resolve(null);

	return new Promise((resolve) => {
		const cb = `__skor_live_${Math.random().toString(36).slice(2)}`;
		const script = document.createElement('script');
		let selesai = false;

		const bersihkan = () => {
			try {
				delete window[cb];
			} catch {
				window[cb] = undefined;
			}
			script.remove();
		};

		const tutup = (hasil) => {
			if (selesai) return;
			selesai = true;
			clearTimeout(timer);
			bersihkan();
			resolve(hasil);
		};

		const timer = setTimeout(() => tutup(null), batasMs);

		window[cb] = (payload) => {
			try {
				const skpd = parseGviz(payload);
				tutup(skpd.length ? { skpd, diambil: new Date().toISOString() } : null);
			} catch {
				tutup(null);
			}
		};

		script.onerror = () => tutup(null);
		script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json;responseHandler:${cb}`;
		document.head.appendChild(script);
	});
}
