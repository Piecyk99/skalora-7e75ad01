# Skalora — cockpit operacyjny

Panel pozysku firm na wdrożenie CRM + partnerstwo. React 18 + TS + Vite + Tailwind +
shadcn/ui + Supabase. **Samodzielna aplikacja** — własny, OSOBNY projekt Supabase
(nie współdzieli bazy z landingiem Skalory, EkoTechniką ani żadnym istniejącym projektem).

> Faza 1: schemat + RLS + RPC + cockpit + pipeline. Agenci AI (prospektor/copywriter)
> i wysyłka maili są przygotowane w schemacie (`prospects`, `outreach`) ale **NIE** wdrożone.
> `credit_clients` (pośrednictwo kredytowe) to osobny projekt — świadomie poza zakresem.

## Uruchomienie

1. Utwórz **świeży, osobny** projekt Supabase.
2. `cp .env.example .env` i uzupełnij `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.
3. Ustaw `project_id` w `supabase/config.toml` na ref nowego projektu.
4. Wypchnij schemat: `supabase link --project-ref <ref> && supabase db push`.
5. `npm install && npm run dev` (port 8081).
6. Zarejestruj konto, następnie na ekranie logowania kliknij **„Zostań pierwszym adminem”**
   (działa tylko gdy w systemie nie ma jeszcze admina) — albo zaloguj się jako
   `dpsolutionsbusiness@gmail.com` (seed nada rolę admin po pierwszym logowaniu).

## Zasady architektoniczne (egzekwowane w kodzie)

- **RLS deny-by-default** na każdej tabeli, zero polityk `using(true)`.
- **RBAC additive** przez junction `public.user_roles` (multi-role); brak kolumny `role` w `profiles`.
- **SSOT statusu**: zmiana `partner_leads.status` wyłącznie przez `rpc_partner_lifecycle`.
  Front nie ma grantu kolumnowego na `status` — fizycznie nie zmieni go bez RPC.
- **Audit** każdej zmiany stanu → `activity_log` (wpis tylko przez RPC).
- **RODO**: `consents` od pierwszej migracji, dwucelowe (`wdrozenie_crm` + `finansowanie`),
  zapis wyłącznie przez RPC.
- **Method B comp**: `kontrakt_wartosc` + `prowizja_pct` tylko na `partner_leads`.
  Brak pola „udział w prowizji kredytowej”.
- **ALTER TYPE … ADD VALUE** zawsze w osobnej migracji (enumy tworzone w `20260614120000_enums.sql`).

## Testy

```bash
npm test          # vitest run
```

- **Jednostkowe** (`src/lib/__tests__/partnerStatus.test.ts`) — graf dozwolonych/niedozwolonych
  przejść statusów (lustro `partner_status_can_transition` z DB). Uruchamiają się zawsze.
- **Integracyjne** (`src/test/integration/*`) — rzeczywisty `rpc_partner_lifecycle` (walidacja
  przejść + autoryzacja) oraz odmowa RLS przy odczycie/edycji cudzego `partner_lead` przez
  innego handlowca. Wymagają żywego projektu Supabase z zaaplikowanymi migracjami; **pomijane**
  (`skipIf`) dopóki nie ustawisz:

  ```bash
  COCKPIT_TEST_SUPABASE_URL=...        # url świeżego projektu testowego
  COCKPIT_TEST_ANON_KEY=...            # klucz anon
  COCKPIT_TEST_SERVICE_ROLE_KEY=...    # service role (seed/cleanup userów i leadów)
  ```

  Używaj OSOBNEGO projektu testowego — testy tworzą i usuwają userów oraz leady.

## Jakość

`npm run build` ✓ · `tsc --noEmit` ✓ · `npm run lint` ✓ · `npm test` (21 unit ✓, 11 integ. skipIf)
