# 🌳 Drzewo Genealogiczne (Family Tree App)

[![Playwright Tests](https://github.com/Cynt4/drzewo-genealogiczne/actions/workflows/playwright.yml/badge.svg)](https://github.com/Cynt4/drzewo-genealogiczne/actions)

Interaktywna aplikacja webowa do wizualizacji i zarządzania powiązaniami rodzinnymi. Projekt łączy interfejs graficzny oparty na bibliotece Balkan.js z lekkim backendem w Node.js, a jego niezawodność gwarantuje rozbudowany framework testowy napisany w Playwright (testy E2E oraz integracyjne testy API), wpięty w proces CI/CD.

## 🚀 Funkcjonalności

- **Interaktywna wizualizacja:** Graficzne przedstawienie powiązań rodzinnych (rodzice, małżonkowie) przy użyciu silnika Balkan.js.
- **Zarządzanie danymi:** Dodawanie nowych członków rodziny oraz edycja istniejących z poziomu responsywnego formularza.
- **Architektura REST (lekkie API):** Zapis i odczyt danych strukturalnych obsługiwane przez dedykowany serwer Express.js.
- **Izolacja środowisk:** Osobne bazy danych (pliki JSON) dla środowiska produkcyjnego (`data.json`) oraz testowego (`test-data.json`), gwarantujące bezpieczeństwo danych.

## 🛠️ Stack Technologiczny

**Aplikacja:**

- **Frontend:** HTML5, CSS3, Vanilla JavaScript, Balkan.js (FamilyTree JS)
- **Backend:** Node.js, Express.js

**Inżynieria Jakości (QA & DevOps):**

- **Framework testowy:** Playwright (TypeScript)
- **Rodzaje testów:** End-to-End (UI) oraz Testy Kontraktowe API (bezgłowe)
- **CI/CD:** GitHub Actions (Ubuntu Runner)

## 💻 Uruchomienie lokalne

1. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/TWOJA_NAZWA/TWOJE_REPO.git
   ```
2. Przejdź do folderu projektu i zainstaluj zależności:
   ```bash
   cd TWOJE_REPO
   npm install
   ```
3. Uruchom aplikację:
   ```bash
   npm start
   ```
4. Otwórz przeglądarkę pod adresem: `http://localhost:3000`

## 🧪 Architektura Testów i Automatyzacja

Projekt posiada zaawansowaną konfigurację testową, która rozwiązuje typowe problemy automatyzacji, takie jak _Test Pollution_ (zanieczyszczanie danych) oraz _Race Conditions_ (wyścig wątków).

### Uruchamianie testów:

Aby uruchomić pełen pakiet testów E2E oraz API, użyj komendy:

```bash
npm run test:e2e
```

_Skrypt ten automatycznie uruchomi serwer ze zmienną środowiskową przypinającą go do testowej bazy danych, a następnie wykona testy Playwright._

### Cechy frameworka testowego:

- **Twardy reset danych (Global Setup):** Przed uruchomieniem pakietu testowego, baza danych jest resetowana z pliku `empty-data.json`.
- **Izolacja na poziomie testu (`beforeEach`):** Każdy test przygotowuje czysty stan początkowy, co gwarantuje pełną deterministyczność.
- **Bezpieczeństwo współbieżności:** Ze względu na współdzielony zasób plikowy, mutowalne testy są skonfigurowane w trybie `serial` (sekwencyjnym) oraz ograniczone do 1 wątku (`workers: 1`).
- **Testy API (APIRequestContext):** Weryfikacja kodów HTTP (np. 400, 422) oraz struktury JSON z pominięciem renderowania warstwy UI, co zapewnia błyskawiczny czas wykonania.

## ⚙️ Ciągła Integracja (CI/CD)

Projekt wykorzystuje **GitHub Actions** do automatycznej weryfikacji każdego wysłanego kodu.
Pipeline (`playwright.yml`) został zoptymalizowany pod kątem szybkości i kosztów:

- Używa komendy `npm ci` dla gwarancji zamrożonych wersji paczek.
- Ogranicza instalację zależności Playwright tylko do używanych przeglądarek (Chromium, Firefox).
- Wykorzystuje mechanizm **Cache** (wstrzykiwanie pobranych wcześniej binarów przeglądarek), co drastycznie skraca czas wykonania zadań.
- Posiada ustawiony `timeout-minutes` oraz automatyczny zrzut artefaktów (raportów HTML) po nieudanych testach do celów debugowania.
