import { test, expect } from '@playwright/test';

test.describe('Smoke tests', () => {
  test('Application should load correctly', async ({ page }) => {
    const response = await page.goto('/');

    expect(response?.ok()).toBeTruthy();

    await expect(page).toHaveTitle('Drzewo Genealogiczne');
  });
});
