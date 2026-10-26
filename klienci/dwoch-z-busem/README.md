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

Folder nie jest częścią aplikacji SKALORA: żaden workflow w `.github/` go nie wdraża, a build Vite go nie dotyka.

## Praca z telefonu

Otwórz Claude Code (aplikacja Claude albo claude.ai/code), wybierz repo `skalora-7e75ad01` i pisz np.:
„W klienci/dwoch-z-busem/strona/index.html zmień w CONFIG cenę kawalerki na 700 zł”.

## Podgląd na komputerze

```bash
python -m http.server 8123 --directory klienci/dwoch-z-busem/strona
```
Potem http://localhost:8123

## Zasady treści

- Tylko prawdziwe opinie, zdjęcia realizacji i liczby. Czego nie ma w `CONFIG`, strona nie pokazuje.
- Ceny i numery wyłącznie w `CONFIG`, nigdy w HTML.
- Hero to na razie klip stockowy z Pexels (6169121), do podmiany na własny film.
- `flagi.wywoz` ustaw na `false`, dopóki firma nie ma wpisu do BDO.
