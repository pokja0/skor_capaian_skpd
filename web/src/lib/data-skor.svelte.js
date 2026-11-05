/**
 * data-skor.svelte.js — Sumber data bersama untuk semua halaman.
 *
 * Snapshot hasil build dipakai lebih dulu, lalu diganti data live dari Google
 * Sheet begitu tersedia. Status & waktu pengambilan dipakai header.
 */

import snapshot from './data.json';
import {
	hitungSkor,
	beriKuadran,
	ringkas as hitungRingkas,
	tipeSKPD
} from './skoring.js';
import { ambilLive } from './sumber-live.js';

let skpd = $state(snapshot.skpd);
let status = $state('memuat');
let diambil = $state(snapshot.diimpor);
let sumber = $state('snapshot');
let jalan = false;

/** Panggil sekali (onMount) untuk mengambil data live. */
export function muatData() {
	if (jalan) return;
	jalan = true;
	ambilLive().then((live) => {
		if (live?.skpd?.length) {
			skpd = live.skpd;
			status = 'live';
			diambil = live.diambil;
			sumber = 'live';
		} else {
			status = 'snapshot';
		}
	});
}

export const dataSkor = {
	get skpd() {
		return skpd;
	},
	get status() {
		return status;
	},
	get diambil() {
		return diambil;
	},
	get sumber() {
		return sumber;
	},
	get ringkasanSheet() {
		return snapshot.ringkasan;
	},
	get hasil() {
		return hitungSkor(skpd).map((h) => ({ ...h, tipe: tipeSKPD(h.skpd) }));
	},
	get kuadran() {
		return beriKuadran(this.hasil);
	},
	get ringkas() {
		return hitungRingkas(this.hasil);
	}
};
