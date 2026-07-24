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
      await dialog.accept();
    });

    page.on('pageerror', (exception) => {
      throw new Error(`CRASH FRONTENDU: ${exception.message}`);
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

    await page.getByRole('button', { name: 'Zapisz do drzewa' }).click();

    const targetSvgNode = page.getByText('Jan Testowy', { exact: true });

    await targetSvgNode.waitFor({ state: 'attached', timeout: 10000 });
    await expect(targetSvgNode).toBeAttached();
  });
});
