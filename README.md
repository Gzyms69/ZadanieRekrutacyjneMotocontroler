# Formularz Raportu Opon - Motocontroler MVP

Publiczny formularz webowy umożliwiający rzeczoznawcom wprowadzanie raportów o stanie ogumienia pojazdów. Projekt przygotowany jako Proof of Concept z naciskiem na bezpieczeństwo warstwy danych, integralność i architekturę zorientowaną na szybkie dostarczanie wartości biznesowej.

## Technologie

- Frontend: React 19, Vite, TypeScript
- Stylizacja: Tailwind CSS 4
- Walidacja: Zod (schematy danych oraz zmienne środowiskowe)
- Formularze: React Hook Form
- Backend: Supabase (PostgreSQL)

## Bezpieczeństwo i Weryfikacja

Zastosowano wielowarstwowe podejście do bezpieczeństwa, nie ufając danym z warstwy klienta.

1. Row Level Security (RLS): Tabela posiada politykę pozwalającą wyłącznie na operację INSERT dla roli publicznej (anon). Odczyt, edycja i usuwanie rekordów są zablokowane na poziomie silnika bazy danych.
2. Explicit Grants: Zastosowano model uprawnień, w którym dostęp do API dla tabeli został nadany jawnie tylko dla operacji zapisu.
3. Integralność JSONB: Dane opon są przechowywane w ustrukturyzowanej kolumnie JSONB. W bazie zaimplementowano CHECK constraint w SQL, który gwarantuje, że obiekt zawiera dane dla wszystkich czterech kół. Chroni to przed manipulacją API z pominięciem formularza.

### Instrukcja weryfikacji RLS

Aby potwierdzić blokadę odczytu danych, należy wykonać poniższe polecenie (podstawiając odpowiednie klucze z konfiguracji):

```bash
curl -X GET "https://[TWOJ_PROJECT_ID].supabase.co/rest/v1/reports" \
  -H "apikey: [TWOJ_ANON_KEY]" \
  -H "Authorization: Bearer [TWOJ_ANON_KEY]"
```

Oczekiwany wynik: Kod błędu 401 Unauthorized lub 403 Forbidden.

## Decyzje Inżynieryjne

- Constants: Progi biznesowe (np. minimalna głębokość bieżnika 1.6) zostały wydzielone do pliku src/lib/constants.ts, eliminując występowanie tak zwanych magicznych liczb w kodzie.
- Env Validation: Aplikacja weryfikuje istnienie zmiennych środowiskowych przy starcie za pomocą biblioteki Zod, zapobiegając błędom podczas działania z powodu brakującej konfiguracji.
- Warstwa abstrakcji: Logika komunikacji z bazą danych została odseparowana od interfejsu użytkownika w katalogu src/services/, co ułatwia zarządzanie i mockowanie podczas testów.
- UX i Mobile First: Zastosowano akordeony dla sekcji opon na urządzeniach mobilnych w celu zachowania czytelności interfejsu. W widoku desktopowym układ adaptuje się do siatki dwukolumnowej.
- Walidacja i miękkie ostrzeżenia: System odróżnia twarde błędy walidacji (np. format VIN) od ostrzeżeń biznesowych. Zużycie bieżnika poniżej zdefiniowanego progu powoduje wyświetlenie komunikatu, ale nie blokuje operacji zapisu (zaimplementowane z użyciem useWatch).

## Instalacja

1. Sklonowanie repozytorium.
2. Instalacja zależności: npm install
3. Konfiguracja zmiennych środowiskowych w pliku .env.local na podstawie .env.example.
4. Uruchomienie środowiska deweloperskiego: npm run dev

## Rozwój Produkcyjny

Kroki wymagane przed wdrożeniem produkcyjnym jako docelowy system:
- Migracja z modelu JSONB na w pełni relacyjną strukturę tabel.
- Implementacja logiki walidacyjnej po stronie serwera za pomocą Edge Functions.
- Integracja mechanizmów chroniących przed spamem (np. Turnstile/Captcha).
- Dodanie wsparcia dla trybu Offline przy użyciu Service Workers.
