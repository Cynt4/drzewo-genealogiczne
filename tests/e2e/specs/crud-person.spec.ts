import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Edit and Delete operations (Update & Delete)', () => {
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

  test('Edit an existing person and then delete them', async ({ page, request }) => {
    const createResp = await request.post('/api/data', {
      data: { imie: 'Adam', nazwisko: 'Kowal', plec: 'male', miejsceUrodzenia: 'Katowice' },
    });
    expect(createResp.status()).toBe(201);

    const initialGet = page.waitForResponse(
      (r) => r.url().includes('/api/data') && r.request().method() === 'GET',
    );
    await page.goto('/');
    await initialGet;

    const targetSvgNode = page.getByText('Adam Kowal', { exact: true });
    await targetSvgNode.waitFor({ state: 'attached', timeout: 10000 });
    await targetSvgNode.click();

    await expect(page.locator('#formTitle')).toContainText('Tryb: Edycja osoby');
    await page.getByPlaceholder('Nazwisko (wymagane)').fill('Nowy');

    await Promise.all([
      page.waitForURL('**/'), // Oczekujemy ponownego załadowania strony głównej po location.reload()
      page.getByRole('button', { name: 'Zapisz zmiany w osobie' }).click(),
    ]);

    const updatedSvgNode = page.getByText('Adam Nowy', { exact: true });
    await updatedSvgNode.waitFor({ state: 'attached', timeout: 10000 });
    await updatedSvgNode.click();

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Czy na pewno chcesz usunąć tę osobę?');
      await dialog.accept();
    });

    await Promise.all([
      page.waitForURL('**/'),
      page.getByRole('button', { name: 'Usuń osobę z drzewa' }).click(),
    ]);

    await expect(updatedSvgNode).toBeHidden({ timeout: 10000 });
  });
});
