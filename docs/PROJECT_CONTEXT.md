# Kontekst Projektu: Drzewo Genealogiczne

## Cel projektu
Rozwój aplikacji webowej pozwalającej na zarządzanie drzewem genealogicznym, zbudowanej w sposób profesjonalny, przypominający projekt komercyjny. Projekt służy jako środowisko do nauki zaawansowanych praktyk automatyzacji (E2E, API z Playwright), CI/CD (GitHub Actions) oraz dobrych praktyk inżynierskich.

## Aktualny stos technologiczny
- **Frontend:** Vanilla JavaScript, HTML, CSS (serwowane statycznie).
- **Backend:** Node.js z Express.js (obecnie serwowanie plików i proste operacje).
- **Testy:** Playwright, TypeScript.
- **Baza danych:** Pliki JSON (docelowo migracja do własnego API i bazy).

## Sposób uruchamiania
- `npm start` - uruchamia aplikację na porcie 3000.
- `npm run start:test` - uruchamia aplikację na porcie 3000 w trybie testowym (wykorzystuje `test-data.json`).
- `npm run test:e2e` - uruchamia testy Playwright.

## Roadmapa (Obecny etap)
- **Now:** Ustabilizowanie środowiska uruchomieniowego, naprawa konfiguracji, pierwszy test E2E (Smoke), dodanie narzędzi do statycznej analizy kodu (ESLint, Prettier).

## Znane ograniczenia
- Brak bazy danych (dane trzymane w pliku `.json`).
- Brak pełnoprawnego API w Node.js (w planach).