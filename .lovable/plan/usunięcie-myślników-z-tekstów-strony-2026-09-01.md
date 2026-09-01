# Usunięcie myślników („—") z tekstów strony

Długie myślniki w copy wyglądają „AI-owo". Przepiszę wszystkie teksty na stronie tak, żeby brzmiały naturalnie, bez znaków `—` i `–`.

## Co zrobię

- Przejdę przez wszystkie sekcje landing page i zamienię każdy myślnik na naturalną interpunkcję: przecinek, dwukropek, kropka i rozbicie na dwa zdania, zależnie od kontekstu.
- Zdania nie będą tłumaczone „mechanicznie" — tam, gdzie po myślniku była wtrącona myśl, przeformułuję zdanie, żeby czytało się jak napisane przez człowieka.
- Zachowuję sens, długość i ton komunikatów; nie zmieniam layoutu, kolorów ani funkcji.

## Zakres plików

Sekcje strony: Hero, Trust, Problems, Solutions, WhySKALORA, AIAvatar, Process, WhatYouGet, Offer, Results, Transformation, CaseStudy, ForWhom, FAQ, Contact, Footer, Navbar, ChatWidget.

Dodatkowo: `index.html` (tytuł i opis meta / OG) oraz teksty w panelu CRM (`src/components/crm/LeadsList.tsx`).

## Uwagi techniczne

Zmiany wyłącznie w warstwie tekstowej JSX i w metadanych `index.html`. Myślniki użyte jako znak „brak danych" (np. `—` w tabeli CRM) zamienię na „brak" lub pusty stan, żeby nie zostawić przypadkowych kresek.
