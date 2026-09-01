# Prawdziwe logowanie na skalora.pl (/login + Google)

## Problem
Podgląd na `/login` pokazuje 404, bo taka trasa nie istnieje w tej aplikacji (są tylko `/`, `/crm`, `/skalora-crm`). Panel `/crm` jest chroniony wyłącznie hasłem `skalora2024` trzymanym w kodzie, co nie jest realnym zabezpieczeniem.

## Co powstanie
- Strona `/login` w stylu SKALORA (ciemne tło, gradient cyan/purple): logowanie e-mail + hasło oraz przycisk „Zaloguj przez Google".
- Panel `/crm` dostępny tylko dla zalogowanego użytkownika z rolą pracownika. Bez roli: komunikat „brak dostępu" i wylogowanie.
- Przycisk wylogowania w panelu CRM.
- Rejestracja przez formularz wyłączona: dostęp nadaje admin. Pierwsze konto (Twoje, przez Google) samo staje się adminem, dopóki nie ma jeszcze żadnego admina.

## Backend (Lovable Cloud)
- Tabela ról `user_roles` (osobna od profili, wymagane ze względów bezpieczeństwa) z rolami `admin` i `staff`, funkcja `has_role` (security definer), RLS + GRANT-y.
- Funkcja `bootstrap_first_admin`, która nadaje rolę admina pierwszemu zalogowanemu użytkownikowi, gdy w systemie nie ma jeszcze admina.
- Włączenie providera Google (zarządzane poświadczenia Lovable Cloud), wyłączenie anonimowych logowań.

## Szczegóły techniczne
- `src/App.tsx`: nowa trasa `/login`, `/crm` opakowane w `RequireAuth`.
- Nowe pliki: `src/pages/Login.tsx`, `src/hooks/useAuth.tsx` (`onAuthStateChange` + `getUser`, sprawdzenie roli), `src/components/RequireAuth.tsx`.
- Google: `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })` po skonfigurowaniu providera.
- `src/lib/crm-api.ts`: usunięcie `CRM_PASSWORD` i funkcji `login`; `src/components/crm/CRMLogin.tsx` usunięty.
- Bez zmian w `cockpit/` (osobna aplikacja crm.skalora.pl).

## Poza zakresem
- Dane leadów w `/crm` zostają jak są (demo), zmieniamy tylko warstwę logowania.
