# Tutorial Deploy ke Vercel

Panduan ini menjelaskan cara menerbitkan aplikasi **Penilaian Kinerja SKPD** ke internet
secara **gratis** dengan **Vercel**, sekaligus membuatnya **ter-deploy otomatis** setiap kali
kode atau data diperbarui di GitHub.

Perkiraan waktu: **10–15 menit** (sekali saja). Setelah itu, pembaruan data hanya butuh
satu perintah `git push`.

---

## Ringkasan alur

```
Komputer Anda  →  GitHub  →  Vercel (build otomatis)  →  URL publik
```

Setiap `push` ke GitHub, Vercel otomatis menjalankan `bun run build` dan menerbitkan hasilnya.

---

## Prasyarat

| Kebutuhan | Keterangan |
|---|---|
| Akun GitHub | Gratis — https://github.com/signup |
| Akun Vercel | Gratis — daftar dengan akun GitHub (https://vercel.com/signup) |
| Git | Terpasang di komputer |
| Bun | Untuk menguji secara lokal (opsional tapi disarankan) |
| Proyek ini | Folder `skor_capaian_skpd` |

---

## Tahap 1 — Kirim proyek ke GitHub

Buka terminal di folder proyek, lalu jalankan:

```bash
cd skor_capaian_skpd

git init
git add .
git commit -m "Penilaian Kinerja SKPD — dashboard SvelteKit"
git branch -M main
```

Lalu **buat repositori kosong** di GitHub (jangan centang "Add a README"):

1. Buka https://github.com/new
2. Repository name: misalnya `skor-capaian-skpd`
3. Pilih **Public** (boleh juga Private)
4. Klik **Create repository**

Hubungkan dan kirim:

```bash
git remote add origin https://github.com/USERNAME/skor-capaian-skpd.git
git push -u origin main
```

> Ganti `USERNAME` dengan nama pengguna GitHub Anda.

**Yang perlu diperhatikan:**

- Folder `web/node_modules`, `web/.svelte-kit`, dan `web/build` **otomatis diabaikan**
  (sudah diatur di `.gitignore`) — inilah sebabnya repo tetap ringan.
- Berkas `web/bun.lock` **harus ikut** terkirim (jangan diabaikan) agar Vercel memakai
  versi pustaka yang sama persis saat membangun.

**Cek cepat:** buka repo di GitHub — pastikan terlihat folder `web/`, `data/`, `docs/`,
dan **tidak ada** `node_modules`.

---

## Tahap 2 — Impor ke Vercel

1. Buka https://vercel.com dan **login dengan GitHub**.
2. Klik **Add New… → Project**.
3. Pada **Import Git Repository**, pilih repo `skor-capaian-skpd` → **Import**.
4. Pada halaman **Configure Project**, atur:

   | Setelan | Nilai |
   |---|---|
   | Project Name | terserah, mis. `skor-capaian-skpd` |
   | Framework Preset | **Other** |
   | **Root Directory** | **`web`** ← klik "Edit" lalu pilih folder `web` |
   | Build Command | *(biarkan)* — otomatis `bun run build` dari `vercel.json` |
   | Output Directory | *(biarkan)* — otomatis `build` |
   | Install Command | *(biarkan)* — otomatis `bun install` |
   | Environment Variables | tidak perlu |

   > **Penting:** `Framework Preset` harus **Other**, bukan "SvelteKit".
   > Proyek ini memakai SvelteKit *adapter-static* (hasil di folder `build/`), sedangkan
   > preset SvelteKit milik Vercel mengharapkan format lain.

5. Klik **Deploy** dan tunggu sekitar 1–2 menit.

---

## Tahap 3 — Verifikasi

Setelah selesai, Vercel memberi URL seperti:

```
https://skor-capaian-skpd.vercel.app
```

Periksa hal-hal berikut:

- [ ] Lambang Sulawesi Barat dan tagline **"Sulbar Maju dan Sejahtera"** tampil
- [ ] Podium "Tiga Terbaik" terisi (Dinas Pertanian & Peternakan = 78,84)
- [ ] Tabel menampilkan **35 baris**
- [ ] Kartu kuadran di "Kinerja vs Anggaran" dapat diklik
- [ ] Tombol **Unduh XLSX** (hijau) dan **Unduh PDF** (merah) berfungsi
- [ ] PDF memuat **"Lampiran — Data Lengkap"**

Buka di ponsel juga untuk memastikan tampilan responsif.

---

## Memperbarui data di kemudian hari

Yang paling sering berubah hanyalah berkas Excel di folder `data/`. Caranya:

```bash
# 1. ganti berkas data/Capaian OPD.xlsx dengan yang baru
# 2. kirim ke GitHub
git add "data/Capaian OPD.xlsx"
git commit -m "Perbarui data capaian kinerja"
git push
```

Vercel akan otomatis membangun ulang dan menerbitkan versi terbaru — **tidak perlu**
menjalankan `bun run build` di komputer.

> Ingin memastikan dulu di komputer? Jalankan `./jalankan.sh` lalu `cd web && bun run preview`.

---

## Opsional — Domain kustom

1. Vercel → project Anda → **Settings → Domains**
2. Klik **Add**, masukkan domain (mis. `kinerja.sulbarprov.go.id`)
3. Ikuti instruksi DNS dari Vercel (biasanya menambahkan satu record `CNAME` atau `A`)
4. Tunggu penyebaran DNS (beberapa menit s/d beberapa jam) — HTTPS dibuat otomatis

---

## Opsional — Preview sebelum naik ke utama

Push ke branch selain `main`:

```bash
git checkout -b perbaikan-tampilan
# lakukan perubahan
git commit -am "Coba perbaikan tampilan"
git push -u origin perbaikan-tampilan
```

Vercel otomatis membuat **URL Preview** terpisah, sehingga bisa dicek dulu. Bila sudah cocok,
gabungkan ke `main` agar masuk versi produksi.

---

## Opsional — Deploy lewat Vercel CLI (tanpa GitHub)

Jika ingin lebih cepat tanpa GitHub, Vercel CLI juga bisa:

```bash
cd web
bunx vercel          # deploy preview
bunx vercel --prod   # deploy produksi
```

Ikuti perintah login pada terminal. Kekurangannya: pembaruan berikutnya harus dijalankan
manual lagi (tidak otomatis).

---

## Jika terjadi masalah

| Gejala | Penyebab | Solusi |
|---|---|---|
| Halaman kosong / 404 | Framework Preset memakai "SvelteKit" | Set **Framework Preset = Other**; pastikan `web/vercel.json` berisi `"framework": null` |
| Build gagal, `bun: command not found` | Build image tidak mendeteksi Bun | Settings → Environment Variables → tambah `BUN_VERSION` = `1.4.0`, lalu **Redeploy** |
| `No Output Directory named 'build'` | Output/Root Directory salah | Root Directory = `web`, Output Directory = `build` |
| Halaman tampil tanpa gaya (CSS/JS 404) | Root Directory tidak disetel ke `web` | Set **Root Directory = `web`**, lalu Redeploy |
| Perubahan tidak muncul | Cache / commit belum terkirim | Deployments → pilih yang terbaru → **Redeploy**; pastikan `git push` berhasil |
| Unduhan XLSX tidak berfungsi | Versi lama ter-cache di peramban | Muat ulang dengan *hard refresh* (Ctrl/Cmd+Shift+R) |

---

## Catatan tentang paket gratis Vercel

- **Paket Hobby (gratis)** memberi *bandwidth* sekitar 100 GB/bulan — sangat longgar untuk
  dashboard 35 SKPD.
- Hobby ditujukan untuk penggunaan **non-komersial**; dashboard internal pemerintahan
  umumnya sesuai.
- Tidak ada proteksi kata sandi bawaan (itu fitur berbayar). Karena data dinyatakan boleh
  publik, hal ini tidak menjadi kendala.
- Bila ingin proteksi akses gratis, alternatifnya **Cloudflare Pages + Cloudflare Access**.

---

## Berkas terkait

| Berkas | Fungsi |
|---|---|
| `web/vercel.json` | Konfigurasi build Vercel (`framework: null`, output `build`) |
| `web/package.json` | Skrip: `import:data`, `dev`, `build`, `preview` |
| `jalankan.sh` | Membangun ulang secara lokal |
| `README.md` | Ringkasan proyek |
| `docs/METODOLOGI.md` | Metode penilaian dan validasinya |
