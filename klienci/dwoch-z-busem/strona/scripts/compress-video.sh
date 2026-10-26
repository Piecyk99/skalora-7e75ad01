#!/usr/bin/env bash
# Kompresja wideo do hero strony "Dwóch z Busem".
#
# Uruchom z folderu strona/ (Git Bash na Windows też działa):
#   bash scripts/compress-video.sh                 # bierze assets/source/hero.mov
#   bash scripts/compress-video.sh moj-film.mp4    # inny plik źródłowy
#
# Zmienne (opcjonalnie):
#   MAX_SEC=12   maksymalna długość pętli w sekundach
#   WARM=1       lekka ciepła korekcja kolorów (0 = wyłączona)
#   OUT=assets   folder wyjściowy
#
# Wynik:
#   hero.mp4              H.264, szer. 1920, CRF 28, preset veryfast, bez audio, faststart, max 2,5 MB
#   hero.webm             VP9, szer. 1920, bez audio, max 2,5 MB
#   hero-mobile.mp4       720x1280 (pion, kadr ze środka), H.264, max 1,2 MB
#   hero-poster.webp      pierwsza klatka, szer. 1920
#   hero-poster-mobile.webp  pierwsza klatka, 720x1280
#   og.jpg                1200x630 do udostępnień (tylko jeśli jeszcze nie istnieje)
#
# Jeśli plik przekracza limit, skrypt powtarza kodowanie z wyższym CRF (gorsza jakość, mniejszy plik).

set -euo pipefail
cd "$(dirname "$0")/.."

SRC="${1:-assets/source/hero.mov}"
OUT="${OUT:-assets}"
MAX_SEC="${MAX_SEC:-12}"
WARM="${WARM:-1}"

command -v ffmpeg >/dev/null 2>&1 || {
  echo "Brak ffmpeg. Windows: winget install Gyan.FFmpeg, macOS: brew install ffmpeg"; exit 1; }
[ -f "$SRC" ] || { echo "Nie ma pliku źródłowego: $SRC"; exit 1; }
mkdir -p "$OUT"

COLOR=""
if [ "$WARM" = "1" ]; then
  COLOR=",colorbalance=rs=0.04:gs=0.01:bs=-0.04:rm=0.03:bm=-0.03,eq=saturation=1.05"
fi

FF=(ffmpeg -y -hide_banner -loglevel error)
MOBILE_VF="scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280"

size_of() { wc -c < "$1" | tr -d ' '; }

# Długość wyjścia (krótsza z: długość źródła, MAX_SEC) i limit bitrate, który mieści plik w limicie rozmiaru.
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SRC" 2>/dev/null || true)
EFF=$(awk -v d="$DUR" -v m="$MAX_SEC" 'BEGIN { if (d == "" || d + 0 <= 0 || d + 0 > m) d = m; printf "%.2f", d }')
cap_k() { awk -v b="$1" -v d="$EFF" 'BEGIN { printf "%d", b * 8 * 0.9 / d / 1000 }'; }
CAP_HD=$(cap_k $((2560 * 1024)))
CAP_MOB=$(cap_k $((1229 * 1024)))

# encode_limited <plik> <limit_bajtów> <crf_start> <polecenie z __CRF__ w miejscu wartości CRF>
encode_limited() {
  local out="$1" limit="$2" crf="$3"; shift 3
  while :; do
    "${@//__CRF__/$crf}"
    local s; s=$(size_of "$out")
    if [ "$s" -le "$limit" ]; then
      printf '  %-24s %5d KB  (CRF %d)\n' "$(basename "$out")" $((s / 1024)) "$crf"; break
    fi
    if [ "$crf" -ge 44 ]; then
      printf '  %-24s %5d KB  UWAGA: powyżej limitu, skróć film (MAX_SEC)\n' "$(basename "$out")" $((s / 1024)); break
    fi
    crf=$((crf + 2))
    echo "  $(basename "$out"): $((s / 1024)) KB to za dużo, ponawiam z CRF $crf"
  done
}

echo "Źródło: $SRC  (${EFF} s, ciepła korekcja: $WARM, limit bitrate: ${CAP_HD}k / mobile ${CAP_MOB}k)"

encode_limited "$OUT/hero.mp4" $((2560 * 1024)) 28 \
  "${FF[@]}" -i "$SRC" -t "$MAX_SEC" -an \
  -vf "scale=1920:-2${COLOR},format=yuv420p" \
  -c:v libx264 -preset veryfast -crf __CRF__ -maxrate "${CAP_HD}k" -bufsize "$((CAP_HD * 2))k" \
  -profile:v high -movflags +faststart \
  "$OUT/hero.mp4"

encode_limited "$OUT/hero.webm" $((2560 * 1024)) 36 \
  "${FF[@]}" -i "$SRC" -t "$MAX_SEC" -an \
  -vf "scale=1920:-2${COLOR},format=yuv420p" \
  -c:v libvpx-vp9 -crf __CRF__ -b:v "${CAP_HD}k" -row-mt 1 -deadline good -cpu-used 4 \
  "$OUT/hero.webm"

encode_limited "$OUT/hero-mobile.mp4" $((1229 * 1024)) 28 \
  "${FF[@]}" -i "$SRC" -t "$MAX_SEC" -an \
  -vf "${MOBILE_VF}${COLOR},format=yuv420p" \
  -c:v libx264 -preset veryfast -crf __CRF__ -maxrate "${CAP_MOB}k" -bufsize "$((CAP_MOB * 2))k" \
  -profile:v high -movflags +faststart \
  "$OUT/hero-mobile.mp4"

"${FF[@]}" -i "$SRC" -frames:v 1 -vf "scale=1920:-2${COLOR}" -c:v libwebp -quality 78 "$OUT/hero-poster.webp"
"${FF[@]}" -i "$SRC" -frames:v 1 -vf "${MOBILE_VF}${COLOR}" -c:v libwebp -quality 75 "$OUT/hero-poster-mobile.webp"
printf '  %-24s %5d KB\n' "hero-poster.webp" $(( $(size_of "$OUT/hero-poster.webp") / 1024 ))
printf '  %-24s %5d KB\n' "hero-poster-mobile.webp" $(( $(size_of "$OUT/hero-poster-mobile.webp") / 1024 ))

if [ ! -f "$OUT/og.jpg" ]; then
  "${FF[@]}" -i "$SRC" -frames:v 1 \
    -vf "scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630${COLOR}" -q:v 3 "$OUT/og.jpg"
  echo "  og.jpg                   z pierwszej klatki (podmień na lepsze zdjęcie, jeśli masz)"
fi

echo "Gotowe."
