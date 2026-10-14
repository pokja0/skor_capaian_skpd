# Metodologi Penilaian Kinerja SKPD

Dokumen ini menjelaskan bagaimana skor dan kategori pada dashboard dihitung, beserta
hasil validasi dan keterbatasannya. Seluruh angka berasal dari `data/Capaian OPD.xlsx`.

## 1. Ringkasan

- **35 SKPD** dinilai, skala **0–100**.
- Indikator: **6** (semua berarah *benefit* — makin tinggi makin baik).
- Skor tertinggi **78,84**; median **57,31**; rata-rata **49,85**.
- Kategori: Sangat Baik **11**, Baik **4**, Cukup **10**, Kurang **4**, Skor 0 **6**.
- Enam SKPD bercapaian kinerja 0 memperoleh skor **0** (aturan non-kompensatoris).

## 2. Data dan indikator

Sumber: `data/Capaian OPD.xlsx`, sheet "Capaian Triwulan III" (tanpa missing, tanpa duplikat).

| Indikator | Dimensi | Peran |
|---|---|---|
| Capaian Kinerja TW III | D1 Hasil | Output/outcome |
| Realisasi Keuangan TW III | D2 Eksekusi | Proses/penyerapan anggaran |
| Indeks Kematangan Inovasi | D3 Kapasitas | Kapasitas kelembagaan |
| Indeks Kematangan Perangkat Daerah | D3 Kapasitas | Kapasitas kelembagaan |
| Indeks SPBE (TW II) | D3 Kapasitas | Kapasitas kelembagaan |
| Nilai SAKIP (2025) | D3 Kapasitas | Kapasitas kelembagaan |

Korelasi antar indikator lemah (nilai absolut Pearson tertinggi ≈ 0,31), sehingga tidak ada
*pengulangan* indikator dan analisis faktor (PCA) tidak diperlukan.

## 3. Dimensi dan bobot

Bobot tiap dimensi **setara 33,3%**:

| Dimensi | Isi | Bobot efektif per indikator |
|---|---|---|
| D1 Hasil Kinerja | Capaian Kinerja | 33,3% |
| D2 Eksekusi Anggaran | Realisasi Keuangan | 33,3% |
| D3 Kapasitas & Tata Kelola | Inovasi, IK-Perangkat, SPBE, SAKIP | 8,3% masing-masing |

Dasar: tidak ada basis ahli/regulasi untuk membedakan bobot, sehingga dipakai bobot setara
(praktik yang dianjurkan OECD/JRC *Handbook on Constructing Composite Indicators*). Struktur
dua tingkat mencegah dimensi berisi empat indikator mendominasi.

## 4. Normalisasi — absolut berbasis target

Agar skor tidak bergantung pada siapa yang dibandingkan (menghindari bias ketika semua SKPD
bernilai baik), acuan yang dipakai bersifat absolut:

| Indikator | Acuan | Rumus |
|---|---|---|
| Capaian Kinerja | target 100%, nilai >110 dianggap 110 | `min(x, 110)` |
| Realisasi Keuangan | target 100% | `min(x, 100)` |
| Indeks SPBE | skala asli 0–5 | `x / 5 × 100` |
| Nilai SAKIP | skala asli 0–100 | `x` |
| IK-Inovasi, IK-Perangkat | apa adanya | `x` |

Contoh: bila seluruh SKPD bercapaian 95–99%, skornya tetap 95–99 (bukan dipaksa menjadi 1–100
seperti pada normalisasi min-max relatif).

## 5. Agregasi — geometrik (non-kompensatoris)

```
SKOR AKHIR = ∛(D1 × D2 × D3)
```

Rata-rata geometrik membuat skor tidak kompensatoris: kegagalan pada satu dimensi tidak dapat
ditutupi dimensi lain. Karena capaian 0 → D1 = 0, enam SKPD tersebut berskor 0 (seri di dasar).
Pendekatan ini mengikuti praktik indeks non-kompensatoris seperti Indeks Pembangunan Manusia
(UNDP memakai rata-rata geometrik sejak 2010).

## 6. Alternatif yang dipertimbangkan

| Metode | Dasar | Status |
|---|---|---|
| Absolut + geometrik | Non-kompensatoris, acuan target | **Dipilih** |
| Absolut + aritmetik | Kompensatoris | Pembanding |
| Min-max relatif + geometrik / aritmetik | Berbasis rentang sampel | Pembanding |
| Komposit z-score | Standardisasi statistik | Pembanding |
| z → persentil → geometrik | Non-kompensatoris berbasis z | Pembanding |
| Entropy (Shannon, 1948) & CRITIC (Diakoulaki dkk., 1995) | Bobot objektif | Pembanding |
| DEA (Charnes, Cooper, Rhodes, 1978) | Efisiensi input–output | Tidak dapat dipakai (tidak ada data input/output) |
| PCA / analisis faktor | Reduksi dimensi | Tidak relevan (korelasi antar indikator lemah) |

## 7. Validasi

### 7a. Korelasi peringkat antar-metode (vs metode utama)

| Metode | Spearman | Kendall |
|---|---|---|
| Absolut + aritmetik | 0,968 | 0,900 |
| Min-max relatif + geometrik | 0,970 | 0,879 |
| Min-max relatif + aritmetik | 0,902 | 0,772 |
| z → persentil → geometrik | 0,884 | 0,721 |
| Entropy + aritmetik | 0,837 | 0,669 |
| Komposit z-score | 0,548 | 0,407 |
| CRITIC + aritmetik | 0,588 | 0,428 |

Kesimpulan peringkat **kokoh** terhadap penggantian metode (umumnya > 0,9), kecuali metode yang
mengubah hakikat pembobotan secara mendasar (z-score/CRITIC).

### 7b. Sensitivitas bobot (Monte Carlo, 4.000 iterasi)

Bobot tiga dimensi diacak di sekitar nilai setara. Hasil: **21 dari 35 SKPD stabil**
(rentang peringkat ≤ 3 posisi); median lebar rentang 3 posisi. Peringkat paling sensitif:
Biro Pemerintahan & Kesra (#22, rentang #15–#25), RSUD (#5, #2–#10), Dinas Perpustakaan
(#6, #3–#11), Dinas Sosial (#11, #6–#14), Dinas Kelautan (#23, #17–#25) — umumnya SKPD
berdimensi tidak seimbang.

### 7c. Sensitivitas outlier

Setelah nilai ekstrem di-*winsorize* pada persentil 5–95 (nilai asli tidak diubah), perubahan
peringkat terbesar: RSUD #5 → #10, Dinas Tanaman Pangan #1 → #4, Badan Pendapatan Daerah #3 → #1.

## 8. Kategori dan kestabilan

Kategori memakai **ambang absolut** (bukan kuantil) agar tahun yang "semua bagus" tetap
menghasilkan kategori bagus:

| Kategori | Rentang | Jumlah |
|---|---|---|
| Sangat Baik | ≥ 70 | 11 |
| Baik | 60 – <70 | 4 |
| Cukup | 45 – <60 | 10 |
| Kurang | >0 – <45 | 4 |
| Skor 0 | = 0 | 6 |

Pembenaran: ketiga ambang berada di **celah alami** data (tidak ada SKPD pada 64,23–70,02;
59,20–61,36; 39,15–48,90), sehingga menggeser ambang sedikit tidak mengubah hasil. Uji
k-means 1-D menghasilkan pusat klaster 74,3 · 61,8 · 53,4 · 32,4 yang sejalan.

## 9. Keterbatasan

1. **Periode tidak seragam**: Indeks SPBE = Triwulan II, Nilai SAKIP = 2025, sisanya Triwulan III.
2. **Tanpa data konteks**: pagu anggaran dan jumlah pegawai tidak tersedia, sehingga perbandingan
   antar SKPD tidak dapat dikelompokkan menurut skala dan analisis efisiensi (DEA) tidak mungkin.
3. **Insentif capaian >100%**: capaian di atas target tetap diberi skor (dipotong di 110%), yang
   berpotensi mendorong penetapan target rendah; capaian 0 perlu diklarifikasi (bukan data hilang).
4. **Posisi tengah sensitif** terhadap bobot (lihat 7b).

## 10. Menghitung ulang

Data, perhitungan, dan tampilan sepenuhnya berjalan dengan JavaScript/Bun:

```bash
cd web
bun run build      # impor ulang XLSX + bangun situs statis
bun run preview    # pratinjau hasil build
```

Untuk memperbarui data: ganti `data/Capaian OPD.xlsx`, lalu jalankan `bun run build`.
