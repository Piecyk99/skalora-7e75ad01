#!/usr/bin/env bash
# Zdjęcia do strony: WebP w dwóch rozmiarach (1600 px i 800 px szerokości) z lekką ciepłą korekcją.
#
# Wrzuć oryginały (jpg, jpeg, png) do assets/source/ pod nazwami:
#   zespol.jpg                  wspólnicy przy busie
#   przed-1.jpg, po-1.jpg       pierwsza realizacja (to samo miejsce, ten sam kadr)
#   przed-2.jpg, po-2.jpg ...   kolejne
# i uruchom z folderu strona/:
#   bash scripts/optimize-images.sh
#
# Powstaną np. assets/zespol.webp (1600 px) i assets/zespol-800.webp (800 px).
# Zdjęcia z telefonu zapisz przed eksportem w poprawnej orientacji (obrócone w galerii),
# bo nie każda wersja ffmpeg czyta obrót z EXIF.

set -euo pipefail
cd "$(dirname "$0")/.."

IN="${IN:-assets/source}"
OUT="${OUT:-assets}"
WARM="${WARM:-1}"

command -v ffmpeg >/dev/null 2>&1 || { echo "Brak ffmpeg. Windows: winget install Gyan.FFmpeg"; exit 1; }
mkdir -p "$OUT"

COLOR=""
[ "$WARM" = "1" ] && COLOR=",colorbalance=rs=0.04:gs=0.01:bs=-0.04,eq=saturation=1.04"

shopt -s nullglob nocaseglob
found=0
for f in "$IN"/zespol.* "$IN"/przed-* "$IN"/po-*; do
  case "${f,,}" in *.jpg|*.jpeg|*.png) ;; *) continue ;; esac
  name="$(basename "${f%.*}")"
  name="${name,,}"
  ffmpeg -y -hide_banner -loglevel error -i "$f" -frames:v 1 \
    -vf "scale='min(1600,iw)':-2${COLOR}" -c:v libwebp -quality 78 "$OUT/$name.webp"
  ffmpeg -y -hide_banner -loglevel error -i "$f" -frames:v 1 \
    -vf "scale='min(800,iw)':-2${COLOR}" -c:v libwebp -quality 76 "$OUT/$name-800.webp"
  printf '  %-16s -> %s.webp (%d KB), %s-800.webp (%d KB)\n' "$(basename "$f")" "$name" \
    $(( $(wc -c < "$OUT/$name.webp") / 1024 )) "$name" $(( $(wc -c < "$OUT/$name-800.webp") / 1024 ))
  found=1
done

[ "$found" = "1" ] || echo "Nie znalazłem zdjęć w $IN (zespol.jpg, przed-1.jpg, po-1.jpg...)."
