# gym.skalora.pl: openGym za Cloudflare Tunnel

openGym (https://github.com/DuarteSantos8/openGym, nie kopia `arvids-unavailable/openGym`)
to serwer w Dockerze, który trzyma dane w plikach JSON. Nie da się go uruchomić na
Cloudflare Workers/Pages. Potrzebuje maszyny z Dockerem, która działa non-stop.
Cloudflare zajmuje się domeną, HTTPS i tunelem. Nie trzeba otwierać portów.

## Gdzie to postawić za darmo
Oracle Cloud "Always Free" (VM ARM z Ubuntu, 1-4 vCPU). Wymaga karty do weryfikacji,
nic z niej nie pobiera. Alternatywa: każdy stary komputer lub mini-PC z Linuksem.

## Kroki (na maszynie z Dockerem)
```bash
git clone https://github.com/DuarteSantos8/openGym
cd openGym
cp .env.example .env
# w .env ustaw:
#   RP_ID=gym.skalora.pl
#   ORIGIN=https://gym.skalora.pl
docker compose pull
docker compose up -d
```
Sprawdź lokalnie: `curl -I http://localhost:8080`.

## Tunel Cloudflare
1. Cloudflare Zero Trust > Networks > Tunnels > Create tunnel > Cloudflared. Skopiuj token.
2. Public Hostname: subdomena `gym`, domena `skalora.pl`, usługa `http://localhost:8080`.
   Cloudflare sam doda rekord DNS CNAME.
3. Na maszynie, w katalogu z tym plikiem:
   ```bash
   cp .env.example .env     # wpisz TUNNEL_TOKEN
   docker compose -f docker-compose.tunnel.yml up -d
   ```

## Telefon
- iPhone: Safari > otwórz https://gym.skalora.pl > Udostępnij > Dodaj do ekranu głównego.
- Android: Chrome > menu > Dodaj do ekranu głównego (lub APK z repo openGym).
- Konto: Create profile, klucz dostępu zapisze się w telefonie. Wymaga HTTPS i dokładnie tej domeny.

## Backup
Katalog `./data` w openGym zawiera całą bazę. Kopiuj go regularnie.
