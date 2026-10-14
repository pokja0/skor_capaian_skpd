# Dashboard Penilaian Kinerja SKPD

Dashboard eksekutif untuk Sekretaris Daerah: menampilkan **skor, peringkat, dan kategori**
kinerja 35 perangkat daerah, dengan metode **indeks komposit non-kompensatoris**.

Dibangun dengan **SvelteKit (Svelte 5) + Vite + Bun**, memakai **Tailwind CSS** dan komponen
bergaya **shadcn-svelte**. Seluruh perhitungan (impor data, skoring, tampilan) berjalan dengan
JavaScript/Bun — tidak ada lagi skrip Python.

## Menjalankan

```bash
./jalankan.sh
```

Atau manual:

```bash
cd web
bun install
bun run build      # impor data Excel + bangun situs statis
bun run preview    # pratinjau hasil build (http://localhost:4173)
bun run dev        # mode pengembangan
```

**Memperbarui data:** ganti `data/Capaian OPD.xlsx`, lalu `bun run build` lagi.

## Struktur

```
skor_capaian_skpd/
├── data/Capaian OPD.xlsx        # sumber data (tidak diubah)
├── docs/METODOLOGI.md           # metode, validasi, keterbatasan
├── netlify.toml                 # konfigurasi deploy Netlify
├── jalankan.sh                  # satu perintah untuk membangun ulang
└── web/
    ├── scripts/import-xlsx.mjs  # Excel → JSON (tanpa dependensi)
    ├── src/lib/
    │   ├── skoring.js           # mesin skor
    │   ├── ekspor.js            # unduh XLSX & cetak PDF
    │   ├── data.json            # hasil impor
    │   └── components/          # komponen dashboard + UI (shadcn-svelte)
    ├── src/routes/+page.svelte  # halaman dashboard
    ├── vercel.json              # konfigurasi deploy Vercel
    └── build/                   # hasil build (siap hosting)
```

## Isi dashboard

- **Header identitas**: lambang Sulawesi Barat, "Pemerintah Provinsi Sulawesi Barat", tagline
  *"Sulbar Maju dan Sejahtera"*, tombol **Unduh XLSX** dan **Unduh PDF**.
- **Tiga Terbaik** (podium visual) dan **Ringkasan & Insight**: tiga angka kunci (rata-rata, median,
  rentang) plus analisis singkat — dirancang agar tidak mengulang informasi yang sudah tampil di
  podium, donut, atau kartu peringatan.
- **Peringkat & skor** 35 SKPD: pencarian, filter kategori & jenis, **header "Dimensi" yang di-merge**
  dengan nilai angka Hasil/Eksekusi/Kapasitas, serta **klik baris** untuk melihat nilai indikator asli.
- **Distribusi kategori**, dan kartu peringatan berwarna **Prioritas / Perhatian / Informasi**.
- **Kinerja vs Anggaran**: diagram sebar capaian kinerja terhadap penyerapan anggaran, dengan garis
  rata-rata dan empat kuadran (Optimal / Telusuri / Efisien / Perlu perhatian). **Klik sebuah kuadran**
  untuk menyaring grafik dan menampilkan daftar SKPD di dalamnya; kursor ke titik untuk detail.
- **Unduhan**: **XLSX** memuat seluruh nilai asli indikator, skor dimensi, dan kuadran tiap SKPD;
  **PDF** menyertakan **Lampiran — Data Lengkap** (35 SKPD × skor dimensi + nilai asli + kuadran).
- **Catatan Penting & Metodologi** dalam satu panel yang dapat dibuka (menekan beban kognitif).

## Deploy (hosting statis)

Hasil build adalah situs statis murni di `web/build/`, dapat dihosting di mana saja.

**Panduan langkah demi langkah untuk Vercel: [`docs/DEPLOY_VERCEL.md`](docs/DEPLOY_VERCEL.md).**

- **Vercel**: impor repo, set *Root Directory* = `web` dan Framework Preset = **Other**
  (konfigurasi `web/vercel.json` sudah tersedia). Deploy otomatis setiap `git push`.
- **Netlify**: konfigurasi `netlify.toml` sudah tersedia (base `web`, publish `build`).
- **GitHub Pages / hosting statis lain**: unggah isi `web/build/`.
  Untuk GitHub Pages *project site*, setel `paths.base` pada konfigurasi SvelteKit di
  `web/vite.config.js` (mis. `/nama-repo`).

> ⚠️ **Keamanan:** situs statis membuat data kinerja 35 SKPD dapat diakses publik.
> Bila perlu dibatasi, gunakan hosting privat atau proteksi (mis. *password protection* di Vercel).

## Identitas & logo

Header menampilkan **lambang Provinsi Sulawesi Barat**, identitas *Pemerintah Provinsi
Sulawesi Barat*, dan tagline **"Sulbar Maju dan Sejahtera"**.

- Berkas logo: `web/static/lambang-sulbar.svg`.
- **Untuk mengganti dengan file resmi Anda** (mis. logo lengkap Pemprov): taruh berkasnya di
  `web/static/` dan sesuaikan `src="/..."` pada `<img>` di `web/src/routes/+page.svelte`.
- Lambang yang dipakai berasal dari berkas lambang resmi Sulawesi Barat (ditetapkan
  Perda Sulbar No. 08 Tahun 2006), diambil dari Wikimedia Commons — simbol pemerintahan
  yang bebas hak cipta menurut UU No. 19 Tahun 2002 Pasal 14(b).

## Metode (ringkas)

- 6 indikator → 3 dimensi (Hasil, Eksekusi, Kapasitas), bobot dimensi setara 33,3%.
- Normalisasi **absolut berbasis target** (skor tidak bergantung peserta lain).
- Agregasi **geometrik** `∛(D1 × D2 × D3)` → non-kompensatoris (capaian 0 ⇒ skor 0).
- Kategori ambang absolut: ≥70 Sangat Baik · 60–70 Baik · 45–60 Cukup · <45 Kurang · =0 Capaian 0.

Rincian lengkap: [`docs/METODOLOGI.md`](docs/METODOLOGI.md).
