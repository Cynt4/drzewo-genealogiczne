import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('API: Zarządzanie strukturą danych drzewa', () => {
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

  test('POST - proper data structure', async ({ request }) => {
    const validPayload = [
      {
        id: '1',
        imie: 'Adam',
        nazwisko: 'Kowalski',
        plec: 'male',
      },
    ];

    const response = await request.post('/api/data', {
      data: validPayload,
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Zapisano poprawnie');
  });

  test('POST - return code error 400 when payload is not an array', async ({ request }) => {
    const invalidPayload = { imię: 'Format', nazwisko: 'Obiektowy' };

    const response = await request.post('/api/data', {
      data: invalidPayload,
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Bad request');
    expect(body.message).toContain('Przesłane dane muszą być tablicą');
  });

  test('POST - return code error 422 when no required forms contained', async ({ request }) => {
    const missingFieldsPayload = [
      {
        id: '2',
        imie: 'Imię',
      },
    ];

    const response = await request.post('/api/data', {
      data: missingFieldsPayload,
    });

    expect(response.status()).toBe(422);

    const body = await response.json();
    expect(body.error).toBe('Unprocessable Entity');
    expect(body.message).toContain(
      "Każda osoba w drzewie musi posiadać wartość dla wymaganych pól 'imię' i 'nazwisko'.",
    );
  });

  test('PUT - update existing person', async ({ request }) => {
    await request.post('/api/data', { data: [{ id: '1', imie: 'Jan', nazwisko: 'Test' }] });

    const response = await request.put('/api/data/1', {
      data: { imie: 'Jan', nazwisko: 'Nowak' },
    });

    expect(response.status()).toBe(200);

    const get = await request.get('/api/data');
    const data = await get.json();
    expect(data[0].nazwisko).toBe('Nowak');
  });

  test('DELETE - remove the person', async ({ request }) => {
    await request.post('/api/data', { data: [{ id: '1', imie: 'Jan', nazwisko: 'Test' }] });

    const response = await request.delete('/api/data/1');
    expect(response.status()).toBe(200);

    const get = await request.get('/api/data');
    const data = await get.json();
    expect(data.length).toBe(0);
  });
});
