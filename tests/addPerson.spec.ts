import { test, expect } from '@playwright/test';

test.describe('Adding new people to the tree', () => {

    test('Add new living person to the tree', async ({ page }) => {
        await page.goto('/');

        await page.getByPlaceholder('Imię (wymagane)').fill('Jan');
        await page.getByPlaceholder('Nazwisko (wymagane').fill('Testowy');

        await page.locator('#plec').selectOption('male');

        await page.getByPlaceholder('Data ur. (DD-MM-RRRR').fill('01-01-1990');
        await page.getByPlaceholder('Miejsce ur.').fill('Katowice');

        await page.getByRole('button', { name: 'Zapisz do drzewa'}).click();

        const treeContainer = page.locator('#tree');
        await expect(treeContainer).toContainText('Jan');
        await expect(treeContainer).toContainText('Testowy');
    })
});

