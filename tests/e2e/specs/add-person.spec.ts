import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Adding new people to the tree', () => {

    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async() => {
        const rootPath = process.cwd();
        const emptyData = path.join(rootPath, 'data', 'empty-data.json');
        const testData = path.join(rootPath, 'data', 'test-data.json');
        fs.copyFileSync(emptyData, testData);
    });

    test('Add new living person to the tree', async ({ page }) => {
        
        // --- NARZĘDZIA DETEKTYWISTYCZNE ---
        page.on('dialog', async dialog => {
            console.log('\n=========================================');
            console.log('🚨 ALERT Z FRONTENDU:', dialog.message());
            console.log('=========================================\n');
            await dialog.accept();
        });
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('❌ BŁĄD KONSOLI PRZEGLĄDARKI:', msg.text());
            }
        });
    
        await page.goto('/');

        await page.getByPlaceholder('Imię (wymagane)').fill('Jan');
        await page.getByPlaceholder('Nazwisko (wymagane)').fill('Testowy'); 
        await page.locator('#plec').selectOption('male');
        await page.getByPlaceholder('Data ur. (DD-MM-RRRR)').fill('01-01-1990');
        await page.getByPlaceholder('Miejsce ur.').fill('Katowice');

        await page.getByRole('button', { name: 'Zapisz do drzewa'}).click();

        await expect(page.getByText('Jan')).toBeVisible();
        await expect(page.getByText('Testowy')).toBeVisible();
    });
});