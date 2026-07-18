import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Adding new people to the tree', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async () => {
    const rootPath = process.cwd();
    const emptyData = path.join(rootPath, 'data', 'empty-data.json');
    const testData = path.join(rootPath, 'data', 'test-data.json');

    if (!fs.existsSync(emptyData)) {
      fs.writeFileSync(emptyData, '[]', 'utf8');
    }
    fs.copyFileSync(emptyData, testData);
  });

  test('Add new living person to the tree', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      console.log('\n=========================================');
      console.log('🚨 ALERT Z FRONTENDU:', dialog.message());
      console.log('=========================================\n');
      await dialog.accept();
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`❌ BŁĄD KONSOLI: ${msg.text()}`);
        console.log(`📍 URL Z BŁĘDEM: ${msg.location().url}`);
      }
    });

    const initialGet = page.waitForResponse(
      (r) => r.url().includes('/api/data') && r.request().method() === 'GET',
    );
    await page.goto('/');
    await initialGet;

    await page.getByPlaceholder('Imię (wymagane)').fill('Jan');
    await page.getByPlaceholder('Nazwisko (wymagane)').fill('Testowy');
    await page.locator('#plec').selectOption('male');
    await page.getByPlaceholder('Data ur. (DD-MM-RRRR)').fill('01-01-1990');
    await page.getByPlaceholder('Miejsce ur.').fill('Katowice');

    // --- 1. DEKLARACJA OBIETNIC SIECIOWYCH (PRZED KLIKNIĘCIEM) ---

    // Obietnica dla requestu POST (zapis danych)
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/data') && response.request().method() === 'POST',
    );

    // Obietnica dla requestu GET (pobranie danych po przeładowaniu)
    const postReloadGetPromise = page.waitForResponse(
      (response) => response.url().includes('/api/data') && response.request().method() === 'GET',
    );

    // --- 2. WYZWOLENIE AKCJI ---
    await page.getByRole('button', { name: 'Zapisz do drzewa' }).click();

    // --- 3. SYNCHRONIZACJA SIECIOWA ---
    // Czekamy, aż serwer przyjmie dane
    await responsePromise;
    // Czekamy, aż aplikacja się przeładuje i pobierze nowe dane
    await postReloadGetPromise;

    // --- 4. KULOOPORNA SYNCHRONIZACJA DOM I ASERCJA SVG ---
    // Szukamy specyficznego elementu wektorowego <text> wg atrybutu z szablonu Balkan.js
    const targetSvgNode = page.locator('#tree svg text[text-anchor="middle"]', {
      hasText: 'Jan Testowy',
    });

    // Czekamy aż silnik JS wstrzyknie ramkę z tym tekstem do DOM (ignorując tryb strict i ukryte CSS)
    await targetSvgNode.first().waitFor({ state: 'attached', timeout: 10000 });

    // Ostateczna asercja Playwright
    await expect(targetSvgNode.first()).toBeAttached();
  });
});
