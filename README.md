# Penilaian Kinerja SKPD

Dashboard eksekutif untuk Sekretaris Daerah: menampilkan **skor, peringkat, dan kategori**
kinerja 35 perangkat daerah, dengan metode **indeks komposit non-kompensatoris**.

Dibangun dengan **SvelteKit (Svelte 5) + Vite + Bun**, memakai **Tailwind CSS** dan komponen
bergaya **shadcn-svelte**. Seluruh perhitungan (impor data, skoring, tampilan) berjalan dengan
JavaScript/Bun.

**Sumber data:** Google Sheet *"Capaian OPD"* — dibaca **live** saat halaman dibuka (JSONP),
dengan snapshot hasil build sebagai cadangan.

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

**Memperbarui data:** cukup ubah Google Sheet-nya. Untuk memperbarui *snapshot* (cadangan &
isi PDF/XLSX saat offline), jalankan `bun run build` lagi.

## Struktur

```
skor_capaian_skpd/
├── data/snapshot.xlsx           # snapshot terakhir dari Google Sheet (cadangan)
├── data/Capaian OPD.xlsx        # arsip data lama (tidak dipakai build)
├── docs/METODOLOGI.md           # metode, validasi, keterbatasan
├── docs/DEPLOY_VERCEL.md        # panduan deploy
├── jalankan.sh                  # satu perintah untuk membangun ulang
└── web/
    ├── scripts/import-xlsx.mjs  # Google Sheet → data.json (tanpa dependensi)
    ├── src/lib/
    │   ├── skoring.js           # mesin skor 10 indikator
    │   ├── sumber-live.js       # pembacaan live (JSONP) di peramban
    │   ├── ekspor.js            # unduh XLSX & PDF
    │   ├── data.json            # snapshot hasil impor (generated)
    │   └── components/          # komponen dashboard + UI (shadcn-svelte)
    ├── src/routes/+page.svelte  # halaman dashboard
    ├── vercel.json              # konfigurasi deploy Vercel
    └── build/                   # hasil build (siap hosting)
```

## Isi dashboard (2 halaman)

Navigasi memakai **bilah atas (sticky)** dengan tab **Ringkasan** dan **Peringkat**.

**1) Ringkasan** (`/`)
- Kartu KPI: jumlah SKPD, skor tertinggi, rata-rata/median, jumlah perlu perhatian.
- Ringkasan & Insight + distribusi kategori + kartu Prioritas/Perhatian/Cakupan data.
- Diagram sebar **Kinerja vs Anggaran** (4 kuadran, dapat diklik).
- **Tren Data Evaluasi 2020–2026** — pilih indikator lewat kartu, lalu lihat grafik garis dengan
  hover/tooltip per tahun + tabel angka yang bisa dibuka.
- **Komponen SAKIP & Reformasi Birokrasi** (2024 vs 2025).
- **Rincian Perbandingan Nilai SPM** per urusan (2025 vs 2026).
- Catatan Penting & Metodologi (dapat dibuka).

**2) Peringkat** (`/peringkat/`)
- **Tiga Terbaik** (podium emas/perak/perunggu dengan dasar rata).
- **Tabel peringkat** 35 SKPD selebar penuh: pencarian, chip kategori, klik judul kolom
  untuk mengurutkan, **klik baris** untuk rincian 10 indikator (nilai **merah** bila di
  bawah rata-rata SKPD pada indikator tersebut).

**Unduhan** (dari header): **XLSX** memuat 10 nilai asli indikator, 3 skor dimensi, cakupan
data, dan kuadran; **PDF** (teks vektor) memuat ringkasan + tabel utama + Lampiran Data Lengkap.

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

- **10 indikator → 3 dimensi**: Hasil (capaian), Eksekusi (keuangan), Kapasitas & Kepatuhan
  (inovasi, kematangan PD, SPBE, SAKIP, PEKPP, SPM, Evidence MCsP, Evidence SPI).
- Bobot dimensi setara **33,3%**; di dalam D3 indikator dirata-ratakan.
- Normalisasi **absolut berbasis target** (skor tidak bergantung peserta lain).
- Agregasi **geometrik** `∛(D1 × D2 × D3)` → non-kompensatoris (capaian 0 ⇒ skor 0).
- **Data kosong** tidak diikutkan (bobot dinormalisasi ulang); **nilai 0 tetap dinilai 0**.
- Kategori ambang absolut: ≥70 Sangat Baik · 60–70 Baik · 45–60 Cukup · <45 Kurang · =0 Skor 0.

Rincian lengkap: [`docs/METODOLOGI.md`](docs/METODOLOGI.md).
