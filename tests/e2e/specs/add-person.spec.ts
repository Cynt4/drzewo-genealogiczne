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

    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/data') && response.request().method() === 'POST',
    );

    const refreshDataPromise = page.waitForResponse(
      (response) => response.url().includes('/api/data') && response.request().method() === 'GET',
    );

    await page.getByRole('button', { name: 'Zapisz do drzewa' }).click();

    // Czekamy na POST
    await responsePromise;

    // Czekamy na GET następujący po POST wewnątrz app.js
    await refreshDataPromise;

    await expect(async () => {
      const content = await page.locator('#tree').textContent();
      expect(content).toContain('Jan');
      expect(content).toContain('Testowy');
    }).toPass({ timeout: 10000 });
  });
});
