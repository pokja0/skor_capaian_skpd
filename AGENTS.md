# skor_capaian_skpd — Dashboard Penilaian Kinerja SKPD

> Status: aktif · Terakhir diverifikasi: 2026-11-05

## Tujuan

Dashboard eksekutif untuk Sekretaris Daerah Provinsi Sulawesi Barat: skor,
peringkat, dan kategori kinerja 35 perangkat daerah dengan indeks komposit
non-kompensatoris. Hasil akhirnya adalah situs statis yang dapat di-hosting.

## Antarmuka

Bilah navigasi atas (sticky) dengan dua halaman: **Ringkasan** (`/`) untuk KPI, insight,
tren evaluasi, dan ringkasan sheet tambahan; **Peringkat** (`/peringkat/`) untuk podium dan
tabel peringkat. Tren evaluasi memakai pemilih kartu per indikator + grafik hover.
Data live diambil sekali lewat `data-skor.svelte.js` lalu dipakai bersama.

## Stack

- SvelteKit 3 + Svelte 5 + Vite 8, dijalankan dengan Bun.
- Tailwind CSS 4, komponen bergaya shadcn-svelte (`bits-ui`).
- `@sveltejs/adapter-static`; seluruh perhitungan berjalan di JavaScript/Bun.
- Data live dari Google Sheet via JSONP (`gviz`) + snapshot build.
- Ekspor XLSX memakai `write-excel-file`; PDF memakai `jspdf` + `jspdf-autotable`.

## Perintah

| Keperluan | Perintah | Catatan |
|---|---|---|
| Bangun ulang dari Excel | `./jalankan.sh` | `bun install` + impor + build |
| Impor data saja | `cd web && bun run import:data` | Google Sheet → `src/lib/data.json` (+ snapshot) |
| Pengembangan | `cd web && bun run dev` | |
| Build statis | `cd web && bun run build` | Impor data + build ke `web/build/` |
| Pratinjau hasil | `cd web && bun run preview` | `http://localhost:4173` |

Sumber data: Google Sheet *Capaian OPD* (dibaca live di peramban) dengan snapshot `data/snapshot.xlsx`.

## Struktur

```
skor_capaian_skpd/
├── data/snapshot.xlsx             # snapshot terakhir dari Google Sheet (cadangan)
├── docs/METODOLOGI.md             # metode, validasi, keterbatasan
├── docs/DEPLOY_VERCEL.md          # panduan deploy
├── jalankan.sh                    # satu perintah build ulang
├── netlify.toml
└── web/
    ├── scripts/import-xlsx.mjs    # Excel → JSON tanpa dependensi
    ├── src/lib/skoring.js         # mesin skor 10 indikator / 3 dimensi
    ├── src/lib/sumber-live.js     # pembacaan live Google Sheet (JSONP)
    ├── src/lib/ekspor.js          # unduhan XLSX/PDF
    ├── src/lib/data.json          # hasil impor (generated)
    ├── src/lib/components/        # komponen dashboard + UI
    ├── src/routes/+page.svelte    # halaman utama
    └── build/                     # hasil build (generated)
```

## Alur data

`import-xlsx.mjs` mengunduh ekspor XLSX Google Sheet (menyimpan `data/snapshot.xlsx`), membacanya
via `node:zlib`, lalu menulis `web/src/lib/data.json`. Saat halaman dibuka, `sumber-live.js`
menarik data terbaru lewat JSONP dan menggantikan snapshot bila berhasil. Sheet 2–4 ("Data Evaluasi",
"Komponen SAKIP dan RB", "Rincian Perbandingan SPM") diimpor sebagai `ringkasan` dan ditampilkan di
halaman Ringkasan. `skoring.js`
menormalisasi 10 indikator, merata-ratakan D3, mengagregasi tiga dimensi secara geometrik, lalu
menentukan kategori. `ekspor.js` menghasilkan XLSX/PDF. Adapter statis membekukan ke `web/build/`.

## Konvensi

- Excel adalah sumber kebenaran; jangan mengedit `data.json` atau `build/` manual.
- Metode skor (bobot 33,3%, agregasi `∛(D1×D2×D3)`, ambang kategori) hanya boleh
  berubah bersama `docs/METODOLOGI.md`.
- Teks UI dan dokumentasi memakai Bahasa Indonesia.
- Komponen UI mengikuti pola shadcn-svelte yang sudah ada; jangan menambah
  pustaka komponen baru tanpa alasan.
- Jangan menambahkan skrip Python; seluruh pipeline memakai Bun/JavaScript.
- Sumber kebenaran adalah Google Sheet. Sel **kosong = tidak dinilai** (tidak diikutkan, bobot dinormalisasi);
  sel **berisi 0 = dinilai 0**.
- Repositori git aktif di `main`; jangan commit `web/build/` atau `node_modules/`.

## Jebakan

- `bun run build` mengunduh Google Sheet; build gagal bila struktur kolom berubah
  atau jaringan mati dan `data/snapshot.xlsx` belum ada.
- JSONP Google wajib memakai sintaks `tqx=out:json;responseHandler:<nama>`
  (tanda titik dua). Dengan `=` Google mengembalikan `google.visualization…`
  dan gagal.
- Google tidak mengirim header CORS; jangan mengganti JSONP dengan `fetch` biasa.
- Sheet harus tetap berbagi "siapa saja yang punya link dapat melihat".
- Situs statis membuat data kinerja 35 SKPD dapat diakses publik. Bila perlu
  dibatasi, gunakan hosting privat atau proteksi.
- Deploy Vercel: *Root Directory* = `web`, Framework Preset = **Other**.
- Untuk GitHub Pages *project site*, setel `paths.base` di `web/vite.config.js`.
- `web/build/` dan `web/.svelte-kit/` adalah output; jangan diedit manual.

## Definition of done

- [ ] `./jalankan.sh` berhasil dan `web/build/` diperbarui.
- [ ] Bila metode berubah, `docs/METODOLOGI.md` ikut diperbarui.
- [ ] Periksa tampilan lewat `bun run preview` bila mengubah UI.
- [ ] Perbarui `AGENTS.md` bila perintah, struktur, atau alur data berubah.
