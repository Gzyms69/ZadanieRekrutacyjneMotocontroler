# Formularz Raportu Opon - Motocontroler

> **[▶ Live Demo](https://zadanie-rekrutacyjne-motocontroler-iota.vercel.app/)**

Publiczny formularz webowy umożliwiający rzeczoznawcom wprowadzanie raportów o stanie ogumienia pojazdów. Projekt przygotowany jako Proof of Concept z naciskiem na bezpieczeństwo warstwy danych, integralność i architekturę zorientowaną na szybkie dostarczanie wartości biznesowej.

## TL;DR

### ➔ Jakie technologie wybrałem i dlaczego?

React + Supabase zgodnie z zaleceniem z instrukcji. Vite do budowania (szybki, prosty), Zod do walidacji (znany mi z poprzednich projektów), React Hook Form do formularzy (standard branżowy, wydajny), Tailwind CSS do stylów (zero konfiguracji).

### ➔ Jak rozwiązałem kwestię bezpieczeństwa danych?

Row Level Security w PostgreSQL zezwala wyłącznie na `INSERT`. Brak polityki `SELECT/UPDATE/DELETE` = zero dostępu do odczytu, edycji i usuwania. Gotowa komenda `curl` do weryfikacji poniżej.

### ➔ Jakie decyzje techniczne podjąłem (np. struktura danych, sposób budowy formularza, UI)?

Formularz mobile-first z akordeonami na sekcje opon. Dane 4 kół zapisywane atomowo w JSONB (jeden INSERT = cały raport). Walidacja podzielona na twardą (Zod - blokuje submit) i miękką (ostrzeżenie o bieżniku - nie blokuje).

### ➔ Co zrobiłbym inaczej, gdyby to miało wejść na produkcję?

Migracja JSONB na tabele relacyjne z RPC, walidacja server-side (Edge Functions), captcha antyspamowy (Turnstile), testy E2E.

### ➔ Jakie uproszczenia zrobiłem świadomie i dlaczego?

JSONB zamiast tabel relacyjnych (atomowość zapisu, prostota RLS). Rate limiting w localStorage (wystarczający dla PoC). Szczegóły w tabeli niżej.

## Technologie

| Warstwa | Technologia | Dlaczego? |
|---------|-------------|-----------|
| Frontend | React 19, TypeScript, Vite | React zgodnie z zaleceniem z instrukcji. Vite - szybki dev server do prostej SPA. |
| Stylizacja | Tailwind CSS 4 | Zero konfiguracji. |
| Walidacja | Zod 3 | Znany z poprzednich projektów, natywna integracja z TypeScript. |
| Formularze | React Hook Form | Standard branżowy - wydajny, uncontrolled inputs, dynamiczna walidacja z `useWatch`. |
| Backend | Supabase (PostgreSQL) | Supabase zgodnie z zaleceniem z instrukcji. |
| Testy | Vitest | Natywna integracja z Vite, szybki runner. |

## Bezpieczeństwo i Weryfikacja

Zastosowano wielowarstwowe podejście do bezpieczeństwa, nie ufając danym z warstwy klienta.

1. **Row Level Security (RLS):** Tabela posiada politykę pozwalającą wyłącznie na operację `INSERT` dla roli publicznej (`anon`). Odczyt, edycja i usuwanie rekordów są zablokowane na poziomie silnika bazy danych.
2. **Explicit Grants:** Zastosowano model uprawnień zgodny z nowym domyślnym zachowaniem Supabase (kwiecień 2026), w którym dostęp do API dla tabeli został nadany jawnie tylko dla operacji zapisu (`GRANT INSERT`).
3. **Integralność JSONB:** Dane opon są przechowywane w ustrukturyzowanej kolumnie JSONB. W bazie po stronie Supabase zaimplementowano `CHECK` constraint w SQL, który gwarantuje, że obiekt zawiera dane dla wszystkich czterech kół (`FL`, `FR`, `RL`, `RR`), a każde koło jest obiektem z wymaganymi polami (`brand`, `size`, `tread_depth`, `dot`, `rating`). Chroni to przed manipulacją API z pominięciem formularza.

### Weryfikacja zabezpieczeń (Dowód wdrożenia)

Klucz `anon` jest publiczny (zawarty w kodzie frontendowym). Naszym zabezpieczeniem jest architektura bazy danych oparta o odrzucenie domyślnych dostępów API (Explicit Grants) oraz rygorystyczne polityki RLS.

Poniżej znajduje się zestaw 3 testów weryfikujących poszczególne warstwy bezpieczeństwa API.

**Test 1: Próba odczytu danych (Weryfikacja Explicit Grants - brak uprawnień SELECT)**

```bash
curl "https://ovuyfehmtnqsggnkwzrt.supabase.co/rest/v1/reports?select=*" \
  -H "apikey: sb_publishable_nCMuTswybNh1rJzMADEINg_Q2wD-LjO" \
  -H "Authorization: Bearer sb_publishable_nCMuTswybNh1rJzMADEINg_Q2wD-LjO"
```

**Odpowiedź API:**
```json
{"code":"42501","details":null,"hint":"Grant the required privileges to the current role with: GRANT SELECT ON public.reports TO anon;","message":"permission denied for table reports"}
```
*Dowód architektoniczny: Błąd `42501` udowadnia, że zastosowaliśmy strategię Explicit Grants. System odrzuca żądanie natychmiast na poziomie uprawnień roli bazy danych (ponieważ udzieliliśmy wyłącznie uprawnienia `GRANT INSERT`), zanim w ogóle przystąpi do ewaluacji polityk RLS.*

**Test 2: Próba usunięcia danych z poprawnym UUID (Weryfikacja Explicit Grants - brak uprawnień DELETE)**

Aby udowodnić brak uprawnień, musimy podać poprawny składniowo identyfikator.

```bash
curl -X DELETE "https://ovuyfehmtnqsggnkwzrt.supabase.co/rest/v1/reports?id=eq.123e4567-e89b-12d3-a456-426614174000" \
  -H "apikey: sb_publishable_nCMuTswybNh1rJzMADEINg_Q2wD-LjO" \
  -H "Authorization: Bearer sb_publishable_nCMuTswybNh1rJzMADEINg_Q2wD-LjO"
```

**Odpowiedź API:**
```json
{"code":"42501","details":null,"hint":"Grant the required privileges to the current role with: GRANT SELECT, DELETE ON public.reports TO anon;","message":"permission denied for table reports"}
```
*Dowód architektoniczny: Nawet przy podaniu prawidłowo sformatowanego UUID do usunięcia konkretnego rekordu, żądanie jest odrzucane z powodu ścisłego braku uprawnień `DELETE` dla roli `anon`.*

**Test 3: Próba wstrzyknięcia niepoprawnego typu danych (Weryfikacja ścisłego typowania bazy)**

```bash
curl "https://ovuyfehmtnqsggnkwzrt.supabase.co/rest/v1/reports?id=eq.sql_injection_test" \
  -H "apikey: sb_publishable_nCMuTswybNh1rJzMADEINg_Q2wD-LjO" \
  -H "Authorization: Bearer sb_publishable_nCMuTswybNh1rJzMADEINg_Q2wD-LjO"
```

**Odpowiedź API:**
```json
{"code":"22P02","details":null,"hint":null,"message":"invalid input syntax for type uuid: \"sql_injection_test\""}
```
*Dowód architektoniczny: Serwer PostgREST weryfikuje typy parametrów zapytania w odniesieniu do schematu bazy danych przed analizą uprawnień. Zrzuca to z API odpowiedzialność za parsowanie nieprawidłowych danych (np. chroniąc przed wstrzyknięciami).*

## Decyzje Inżynieryjne

- **React Hook Form + FormProvider:** Uncontrolled inputs z `useFormContext()`. Hook `useWatch` pozwala na nasłuchiwanie bieżnika bez re-renderu reszty formularza.
- **Struktura danych:** Tabela `reports` - kolumny `marka`, `model`, `vin` (NOT NULL), `email` (nullable - jedyne opcjonalne pole), `wheels_data` (JSONB NOT NULL). CHECK constraint weryfikuje strukturę JSONB w tym obecność wymaganych pól w obiektach kół.
- **Constants:** Progi biznesowe (np. minimalna głębokość bieżnika 1.6mm) zostały wydzielone do pliku `src/lib/constants.ts`, eliminując magiczne liczby w kodzie.
- **Env Validation:** Aplikacja weryfikuje istnienie zmiennych środowiskowych przy starcie za pomocą Zod, zapobiegając błędom runtime z powodu brakującej konfiguracji.
- **Warstwa abstrakcji:** Logika komunikacji z bazą danych została odseparowana od UI w katalogu `src/services/`, co ułatwia zarządzanie i mockowanie podczas testów.
- **UX i Mobile First:** Zastosowano akordeony dla sekcji opon na urządzeniach mobilnych. W widoku desktopowym układ adaptuje się do siatki dwukolumnowej (lewe koła / prawe koła).
- **Walidacja dwuwarstwowa:** System odróżnia twarde błędy walidacji (np. format VIN - Zod schema) od miękkich ostrzeżeń biznesowych (np. bieżnik < 1.6mm - `useWatch`, nie blokuje zapisu).
- **A11y:** Inputy posiadają `aria-invalid`, `aria-describedby`, powiązanie `label`/`input` przez `htmlFor`/`id`, a akordeony `aria-expanded`.

## Świadome Uproszczenia

Poniższe uproszczenia zostały przyjęte świadomie w kontekście ograniczonego czasu realizacji (MVP/PoC):

| Uproszczenie | Uzasadnienie | Co na produkcji |
|---|---|---|
| **JSONB zamiast modelu relacyjnego** | Atomowość: jeden `INSERT` = cały raport z 4 kołami, zero ryzyka częściowego zapisu. Prostota RLS: jedna tabela = jedna polityka bezpieczeństwa. Adekwatność domeny: dane opon nie istnieją niezależnie od raportu. | Migracja na model relacyjny z dedykowaną funkcją RPC. |
| **Walidacja tylko na frontendzie** | Zod schema pokrywa 100% reguł biznesowych, a CHECK constraint chroni integralność struktury w bazie. | Edge Functions z walidacją server-side. |
| **Rate limiting w localStorage** | Wystarczający dla PoC - blokuje double-submit i spam z jednej przeglądarki. | Captcha (Turnstile) + rate limiting na edge. |
| **Brak walidacji formatu rozmiaru opony** | Zbyt wiele poprawnych formatów (205/55R16, 205/55 R16, 225/45ZR17) - ryzyko false negatives. | Dedykowany parser z bazą rozmiarów. |
| **CHECK constraint sprawdza klucze, nie typy wartości** | Weryfikuje obecność FL/FR/RL/RR i wymaganych pól w każdym kole (brand, size, tread_depth, dot, rating). Nie waliduje typów wartości (np. czy tread_depth jest liczbą). | Walidacja typów w triggerze PL/pgSQL. |
| **DOT - brak walidacji roku** | Format WWYY pokrywa 99%+ przypadków. Walidacja roku z przyszłości i obsługa 3-cyfrowego DOT sprzed 2000 r. pominięte świadomie. | Walidacja dynamiczna z bieżącym rokiem (`new Date().getFullYear()`). |

## Testy

```bash
npm test
```

27 testów jednostkowych walidacji Zod (VIN, DOT, bieżnik, ocena, pełny raport):

```
 ✓ VIN validation (5 tests)
 ✓ DOT validation (6 tests)
 ✓ Tread depth validation (6 tests)
 ✓ Rating validation (5 tests)
 ✓ ReportSchema (5 tests)
```

## Instalacja

```bash
git clone https://github.com/Gzyms69/ZadanieRekrutacyjneMotocontroler.git
cd ZadanieRekrutacyjneMotocontroler
npm install
cp .env.example .env.local   # Uzupełnij klucze Supabase
npm run dev
```

Wymagane: Node.js >= 20.

## Rozwój Produkcyjny

Kroki wymagane przed wdrożeniem produkcyjnym jako docelowy system:

- Migracja z modelu JSONB na w pełni relacyjną strukturę tabel z RPC.
- Implementacja logiki walidacyjnej po stronie serwera za pomocą Edge Functions.
- Integracja mechanizmów chroniących przed spamem (np. Turnstile/Captcha).
- Dodanie wsparcia dla trybu Offline przy użyciu Service Workers.
- Rozbudowa testów o testy komponentów i E2E.
