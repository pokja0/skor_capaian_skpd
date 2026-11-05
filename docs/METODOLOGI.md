# Metodologi Penilaian Kinerja SKPD

Dokumen ini menjelaskan cara skor dan kategori dihitung, hasil validasi, dan keterbatasannya.
Seluruh angka dihitung dari data Google Sheet *"Capaian OPD"*.

## 1. Ringkasan

- **35 SKPD**, **10 indikator**, **3 dimensi**, skala **0–100**.
- Skor akhir = rata-rata **geometrik** antar-dimensi (non-kompensatoris).
- Indikator yang tidak dinilai (sel kosong) **tidak diikutkan**; bobot dinormalisasi ulang.
  Nilai **0 tetap dihitung 0**.
- SKPD bercapaian kinerja **0** memperoleh skor **0**.

## 2. Sumber data & pembaruan

- Sumber: Google Sheet *"Capaian OPD"* (`1fPM5xEJ…`), sheet **Capaian Triwulan III**.
- **Live**: saat halaman dibuka, data ditarik langsung dari Google (JSONP, karena Google tidak
  mengirim header CORS). Bila gagal, dipakai **snapshot** hasil build.
- **Snapshot**: `bun run build` mengunduh ekspor XLSX dari Google lalu menyimpannya di
  `data/snapshot.xlsx` sebagai cadangan.
- Status data (live/snapshot) dan waktu pengambilan ditampilkan di header.

> Syarat: sheet tetap berbagi *"siapa saja yang punya link dapat melihat"*.

## 3. Indikator

| Indikator | Skala asli | Cakupan* | Normalisasi |
|---|---|---|---|
| Capaian Kinerja TW III | % | 35/35 | `min(x, 110)` |
| Realisasi Keuangan TW III | % | 35/35 | `min(x, 100)` |
| Indeks Kematangan Inovasi | poin | 35/35 | apa adanya |
| Indeks Kematangan Perangkat Daerah | poin | 35/35 | apa adanya |
| Indeks SPBE (TW II) | 0–5 | 35/35 | `x / 5 × 100` |
| Nilai SAKIP (2025) | 0–100 | 35/35 | apa adanya |
| PEKPP | 0–5 | 35/35 | `x / 5 × 100` |
| Nilai SPM | 0–100 | 6/35 | apa adanya |
| Pemenuhan Evidence MCsP | 0–100 | 15/35 | apa adanya |
| Pemenuhan Evidence SPI | 0–100 | 4/35 | apa adanya |

\* per snapshot saat dokumen ini diperbarui. Kolom *"Kekurangan Kelengkapan Data"* (5 kolom)
seluruhnya kosong sehingga **tidak dipakai**.

## 4. Dimensi & bobot

| Dimensi | Bobot | Indikator |
|---|---|---|
| **D1 Capaian Kinerja** | 33,3% | Capaian Kinerja |
| **D2 Realisasi Anggaran** | 33,3% | Realisasi Keuangan |
| **D3 Kapasitas & Kepatuhan** | 33,3% | Inovasi, Kematangan PD, SPBE, SAKIP, PEKPP, SPM, Evidence MCsP, Evidence SPI |

Di dalam D3 setiap indikator berbobot setara dan **dirata-ratakan (aritmetik)**.

## 5. Perlakuan data kosong (penting)

| Kondisi sel | Perlakuan |
|---|---|
| **Kosong** | Indikator **tidak dipakai** untuk SKPD itu; bobot dinormalisasi ulang |
| **Berisi 0** | Dipakai sebagai **nilai 0** (dinilai nol), bukan dianggap kosong |

Contoh: SKPD dengan 7 dari 10 indikator dinilai → D3-nya dirata-ratakan dari indikator yang ada
saja, lalu skor akhir tetap dihitung dari tiga dimensi.

Setiap SKPD menampilkan **cakupan data** (mis. 7/10). Cakupan **di bawah 8/10** ditandai
**"data terbatas"** (informasi, bukan penalti).

## 6. Normalisasi

Normalisasi bersifat **absolut** (tidak relatif terhadap peserta), sehingga bila seluruh SKPD
bernilai baik maka semua tetap memperoleh skor tinggi:

- Capaian dipotong di **110%**
- Keuangan memakai target **100%**
- SPBE dan PEKPP (0–5) diskalakan **×20**
- Indikator lain memakai skala aslinya

## 7. Agregasi

```
D1 = skor Capaian
D2 = skor Keuangan
D3 = rata-rata indikator D3 yang tersedia
SKOR AKHIR = ∛(D1 × D2 × D3)
```

Rata-rata geometrik membuat skor **non-kompensatoris**: kelemahan serius pada satu dimensi tidak
dapat ditutupi dimensi lain. Karena capaian 0 → D1 = 0, SKPD tersebut berskor 0.

## 8. Kategori

| Kategori | Rentang |
|---|---|
| Sangat Baik | ≥ 70 |
| Baik | 60 – <70 |
| Cukup | 45 – <60 |
| Kurang | >0 – <45 |
| Skor 0 | = 0 |

Ambang bersifat tetap (absolut) agar tahun yang "semua bagus" tetap menghasilkan kategori bagus.

## 9. Validasi

Dihitung pada data snapshot terbaru (35 SKPD).

**Konsistensi dengan agregasi lain:**

| Pembanding | Spearman | Kendall |
|---|---|---|
| Aritmetik antar-dimensi (kompensatoris) | 0,972 | 0,898 |
| Aritmetik datar 10 indikator | 0,833 | 0,643 |

Kesimpulan peringkat **kokoh** terhadap penggantian cara agregasi antar-dimensi (0,97), dan
masih cukup konsisten bila seluruh indikator dirata-ratakan langsung (0,83).

**Sensitivitas bobot (Monte Carlo, 4.000 iterasi, simpangan bobot ±0,10):**

- **19 dari 35 SKPD stabil** (rentang peringkat ≤ 3 posisi); lebar rentang maksimum 10 posisi.
- Paling sensitif: Biro Umum, RSUD, Dinas Kelautan & Perikanan, Dinas Perpustakaan & Kearsipan —
  umumnya SKPD dengan dimensi tidak seimbang.

## 10. Keterbatasan

1. **Periode tidak seragam**: capaian & keuangan Triwulan III; SPBE Triwulan II; SAKIP 2025.
2. **Cakupan indikator baru tidak merata**: SPM hanya 6 SKPD, Evidence SPI 4 SKPD. Skor SKPD
   dengan cakupan rendah berbasis lebih sedikit indikator (ditandai "data terbatas").
3. **Tanpa data konteks**: pagu anggaran dan jumlah pegawai tidak tersedia, sehingga tidak ada
   pengelompokan peer group maupun analisis efisiensi (DEA).
4. **Capaian > 100%** tetap diberi skor (dipotong 110%), berpotensi mendorong target rendah.
5. **Ketergantungan pada Google**: pembacaan live memakai endpoint JSONP tidak resmi; bila
   berubah, halaman otomatis memakai snapshot.

## 11. Menghitung ulang

```bash
./jalankan.sh            # unduh Google Sheet → snapshot → build
cd web && bun run preview
```

Untuk memperbarui data: ubah Google Sheet, lalu jalankan `./jalankan.sh` (atau cukup buka
halaman — data live akan terbaca otomatis).
