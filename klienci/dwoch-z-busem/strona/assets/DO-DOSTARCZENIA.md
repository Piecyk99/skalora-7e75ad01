# Pliki do folderu assets/

> Teraz (26.10.2026) hero to tymczasowy klip stockowy: Pexels 6169121 „Delivery truck full of boxes”,
> autor Tima Miroshnichenko, licencja Pexels (użycie komercyjne bez podpisu). Źródło: assets/source/hero-pexels-6169121.mp4.
> Z tego klipu jest też og.jpg. Gdy nagracie własny film, wrzućcie go do assets/source/ i uruchomcie
> `bash scripts/compress-video.sh assets/source/wasz-film.mp4`. Pliki hero.* i postery się nadpiszą,
> og.jpg usuńcie ręcznie przed uruchomieniem, żeby powstał nowy.

Tylko prawdziwe materiały: wasz bus, wasza praca, wy. Bez zdjęć ze stocka.
Czego nie ma, strona nie pokazuje (hero ma wtedy granatowe tło, sekcje znikają).

## Najprościej: wrzuć surowe pliki do assets/source/ i uruchom skrypty

| Wrzucasz do assets/source/ | Co ma przedstawiać | Skrypt |
|---|---|---|
| `hero.mov` (albo .mp4 z telefonu) | 8 do 12 s pętli: załadunek busa, pasy, wnoszenie, pusty pokój po robocie. Kamera stabilna, poziomo, bez twarzy klientów, bez tablic rejestracyjnych i numerów domów. Kadruj tak, żeby środek kadru działał też w pionie (wersja mobilna to środek obrazu) | `bash scripts/compress-video.sh` |
| `zespol.jpg` | Obaj wspólnicy przy busie z logo, w ubraniach roboczych, w dziennym świetle. Poziomo 3:2, min. 1600 px szerokości | `bash scripts/optimize-images.sh` |
| `przed-1.jpg` + `po-1.jpg` | Ta sama piwnica lub pokój przed i po opróżnieniu. To samo miejsce, ten sam kadr i wysokość telefonu. Poziomo 4:3, min. 1600 px | `bash scripts/optimize-images.sh` |
| `przed-2.jpg` + `po-2.jpg`, `przed-3.jpg` + `po-3.jpg` | Kolejne realizacje (maks. 3) | jw. |

## Co powstaje w assets/ (i czego szuka strona)

| Plik | Wymiary | Limit | Uwagi |
|---|---|---|---|
| `hero.mp4` | 1920 × 1080, H.264, bez dźwięku | 2,5 MB | desktop |
| `hero.webm` | 1920 × 1080, VP9, bez dźwięku | 2,5 MB | desktop, nowsze przeglądarki |
| `hero-mobile.mp4` | 720 × 1280 (pion), H.264, bez dźwięku | 1,2 MB | telefony < 768 px |
| `hero-poster.webp` | 1920 × 1080 | ok. 100 KB | pierwsza klatka, element LCP na desktopie |
| `hero-poster-mobile.webp` | 720 × 1280 | ok. 50 KB | pierwsza klatka, element LCP na telefonie |
| `og.jpg` | 1200 × 630 | ok. 150 KB | podgląd linku na Facebooku i WhatsAppie. Skrypt robi go z wideo, lepiej podmienić na zdjęcie busa z logo |
| `zespol.webp` + `zespol-800.webp` | 1600 i 800 px szer., 3:2 | | sekcja „Kim jesteśmy” |
| `przed-N.webp`, `po-N.webp` + wersje `-800` | 1600 i 800 px szer., 4:3 | | suwak „Przed i po” |

## Po wrzuceniu plików uzupełnij CONFIG w index.html

- `zespol.imiona` (np. "Marek i Tomek") i popraw `zespol.opis`, bez imion sekcja się nie pokaże
- `beforeAfter`: jedna linijka na realizację (miasto, m³, czas pracy)
- `reviews`, `googleRating`, `googleReviewsCount`, `googleReviewsUrl`: tylko prawdziwe opinie z Google
