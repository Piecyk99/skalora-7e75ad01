# Dwóch z Busem (klient SKALORA)

Firma przeprowadzkowa z Zabrza: przeprowadzki, opróżnianie lokali, transport rzeczy.

| Co | Gdzie |
|---|---|
| Landing (jeden plik HTML, bez builda) | `strona/index.html` |
| Wszystkie ceny, numery, flagi obietnic, opinie, realizacje | obiekt `CONFIG` na końcu `strona/index.html` |
| Logo | `strona/logo.svg` |
| Wideo i zdjęcia | `strona/assets/` (lista plików do dostarczenia: `strona/assets/DO-DOSTARCZENIA.md`) |
| Kompresja wideo i zdjęć (ffmpeg) | `strona/scripts/compress-video.sh`, `strona/scripts/optimize-images.sh` |
| Strategia pozyskiwania zleceń, teksty, plan 30 dni | `system-pozyskiwania-zlecen.md` |

Strona działa pod **https://dwochzbusem.skalora.pl**. Każdy push na `main`, który zmienia coś w tym folderze, wdraża ją automatycznie (`.github/workflows/deploy-dwoch-z-busem.yml`, Cloudflare Worker ze statycznymi plikami, konfiguracja w `wrangler.toml`). Folder `strona/scripts/` i `strona/assets/DO-DOSTARCZENIA.md` nie trafiają na stronę (`strona/.assetsignore`). Build aplikacji SKALORA tego folderu nie dotyka.

## Praca z telefonu

Otwórz Claude Code (aplikacja Claude albo claude.ai/code), wybierz repo `skalora-7e75ad01` i pisz np.:
„W klienci/dwoch-z-busem/strona/index.html zmień w CONFIG cenę kawalerki na 700 zł”.

## Podgląd na komputerze

```bash
python -m http.server 8123 --directory klienci/dwoch-z-busem/strona
```
Potem http://localhost:8123

## Wygląd

Strona ma wyglądać jak rzeczy z busa, nie jak szablon: wąskie wersaliki jak napisy na drzwiach auta (Big Shoulders), pomarańczowa taśma pakowa, karton, kartka z wyceną i paragon w kalkulatorze (IBM Plex Mono), czarny nadruk na papierze. Bez zaokrąglonych kart z cieniem, bez małych etykiet nad nagłówkami, bez animacji przy przewijaniu. Nowe sekcje rób z tych samych elementów.

## Zasady treści

- Tylko prawdziwe opinie, zdjęcia realizacji i liczby. Czego nie ma w `CONFIG`, strona nie pokazuje.
- Ceny i numery wyłącznie w `CONFIG`, nigdy w HTML.
- Teksty bez myślników wtrąconych, bez wyliczanek po trzy („szybko, tanio, solidnie”) i bez ogólników. Konkret: piętro, godzina, kwota, dzielnica.
- Hero to na razie klip stockowy z Pexels (6169121), do podmiany na własny film.
- `flagi.wywoz` ustaw na `false`, dopóki firma nie ma wpisu do BDO.
