#!/usr/bin/env bash
# Membangun ulang dashboard dari data terbaru.
#
# Cara pakai:
#   ./jalankan.sh
#
# Jika data diperbarui: ganti data/Capaian OPD.xlsx lalu jalankan skrip ini.
set -e
cd "$(dirname "$0")/web"

echo "==> 0/2 Memastikan dependensi terpasang ..."
bun install

echo "==> 1/2 Mengimpor data Excel + membangun situs (bun run build) ..."
bun run build

echo
echo "Selesai. Situs statis siap di-hosting ada di:  web/build/"
echo "Pratinjau lokal:  cd web && bun run preview"
