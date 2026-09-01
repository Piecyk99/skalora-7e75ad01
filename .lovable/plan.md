# Przegląd CRM-ów i nadanie Ci dostępu administratora

## Ile jest CRM-ów w projekcie: trzy

**1. `/crm` — działający CRM leadów (skalora.pl)**
- Realne dane z bazy: tabele `leads`, `notes`, `activities`.
- Lista leadów z filtrem statusu, karta szczegółów leada, notatki, historia aktywności, zmiana statusu, prosty dashboard z licznikami.
- Zabezpieczony logowaniem (`/login`) i rolą pracownika.
- Skala: ok. 570 linii kodu, 4 komponenty. Poziom: podstawowy, ale w pełni funkcjonalny.

**2. `/skalora-crm` — makieta demo (prezentacja sprzedażowa)**
- Jeden plik, ok. 985 linii, wszystkie dane są zmyślone (mock), nic nie zapisuje się do bazy.
- Pokazuje wizję dużego systemu: Dashboard, Leady, Zadania, Kanban, Analytics, Finansowanie, Realizacja, Ekipy, Monitor Banków, Oferty.
- Poziom: tylko wygląd, zero logiki biznesowej.

**3. `cockpit/` — osobna aplikacja (crm.skalora.pl)**
- Najbardziej rozbudowana: ok. 1200 linii stron plus 9 hooków, 13 funkcji serwerowych i 30 migracji bazy.
- Moduły: Cockpit, Prospekty, Pipeline, Outreach (wysyłka i śledzenie otwarć/kliknięć), Leady ze strony, Admin (role i uprawnienia).
- Ma role, uprawnienia, RLS, audyt aktywności, zgody, agentów AI (prospector, copywriter, lead-finder, enrich-contact) i cykliczne zadania.
- Uwaga: to oddzielny projekt w tym repo, z własnym backendem i deployem, nie renderuje się w tym podglądzie.

## Co proponuję zrobić teraz

Ustawić `dpsolutionsbusiness@gmail.com` jako konto administratora CRM na skalora.pl, żeby dostęp nie zależał od przycisku „zostań pierwszym adminem”.

1. Migracja bazy: funkcja nadająca rolę `admin` kontu o tym adresie, uruchamiana automatycznie po pierwszym zalogowaniu tym adresem (trigger na nowym użytkowniku plus jednorazowe nadanie roli, gdy konto już istnieje).
2. Usunięcie przycisku „Zostań pierwszym administratorem” z ekranu logowania, bo nie będzie już potrzebny.
3. Zalogowanie się przez Google tym adresem i sprawdzenie, że `/crm` otwiera się z pełnym dostępem.

## Szczegóły techniczne

- Migracja: `public.grant_admin_to_owner()` (SECURITY DEFINER, `search_path = public`) wstawia `('admin')` do `public.user_roles` dla `auth.users.email = 'dpsolutionsbusiness@gmail.com'`, z `ON CONFLICT DO NOTHING`; trigger `AFTER INSERT ON auth.users` nie jest dozwolony na schemacie `auth`, więc zamiast tego wykonuję jednorazowy `INSERT ... SELECT` (konto zakłada się przy pierwszym logowaniu, więc jeśli go jeszcze nie ma, po pierwszym logowaniu uruchamiam tę samą migrację ponownie lub zostawiam RPC `bootstrap_first_admin` jako zapas).
- Alternatywa bez triggera: zostawić `bootstrap_first_admin`, ale zawęzić go do tego jednego adresu e-mail, tak by nikt inny nie mógł się nim posłużyć. To jest wariant, który wybiorę, jeśli konto nie istnieje jeszcze w bazie.
- Bez zmian w `cockpit/` i w makiecie `/skalora-crm`.
