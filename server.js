const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

const TARGET_FILE = process.env.DATA_FILE || 'data.json';
// const DATA_FILE = process.env.NODE_ENV === 'test'
// ? path.join(__dirname, 'test-data.json')
// : path.join(__dirname, 'data.json');
const DATA_FILE = path.join(__dirname, 'data', TARGET_FILE);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// GET DATA
app.get('/api/data', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) {
    return res.json([]);
  }
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    res.json(JSON.parse(data || '[]'));
  } catch (err) {
    // Jeśli JSON jest zepsuty, serwer o tym poinformuje w konsoli!
    console.error('❌ BŁĄD KRYTYCZNY: Uszkodzony format danych.');
    res.status(500).json({ error: 'Błąd formatu danych JSON' });
  }
});

// POST DATA
app.post('/api/data', (req, res) => {
  const newPerson = req.body;

  if (!newPerson || Array.isArray(newPerson) || typeof newPerson !== 'object') {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Przesłane dane muszą być pojedynczym obiektem reprezentującym osobę.',
    });
  }

  if (!newPerson.imie || !newPerson.nazwisko || !validatePerson(newPerson)) {
    return res.status(422).json({
      error: 'Unprocessable Entity',
      message: 'Niepoprawny format danych osoby.',
    });
  }

  try {
    const currentData = fs.existsSync(DATA_FILE)
      ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '[]')
      : [];

    const highestId = currentData.reduce((max, o) => Math.max(max, parseInt(o.id) || 0), 0);
    newPerson.id = String(highestId + 1);

    currentData.push(newPerson);
    fs.writeFileSync(DATA_FILE, JSON.stringify(currentData, null, 2));

    res.status(201).json({ success: true, message: 'Zapisano poprawnie', data: newPerson });
  } catch (err) {
    res.status(500).json({ error: 'Błąd zapisu na serwerze' });
  }
});

// PUT DATA
app.put('/api/data/:id', (req, res) => {
  const id = req.params.id;
  const updatedPerson = req.body;

  let payload = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '[]');
  const index = payload.findIndex((p) => String(p.id) === String(id));

  if (index === -1) return res.status(404).json({ error: 'Nie znaleziono osoby' });

  if (!updatedPerson.imie || !updatedPerson.nazwisko) {
    return res.status(422).json({ error: 'Wymagane imię i nazwisko' });
  }

  payload[index] = { ...payload[index], ...updatedPerson, id };
  fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2));
  res.json({ success: true });
});

// DELETE DATA
app.delete('/api/data/:id', (req, res) => {
  const id = req.params.id;
  let payload = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '[]');
  const filtered = payload.filter((p) => String(p.id) !== String(id));

  if (payload.length === filtered.length) return res.status(404).json({ error: 'Nie znaleziono' });

  fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2));
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Serwer nasłuchuje na bazie danych: data/${TARGET_FILE}`);
});

function validatePerson(person) {
  const nameRegex = /^[A-ZĆŁŃÓŚŹŻ][a-ząćęłńóśźż]*(?: [A-ZĆŁŃÓŚŹŻ][a-ząćęłńóśźż]*)*$/;
  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
  const digitRegex = /^\d*$/;

  if (!person.imie || !nameRegex.test(person.imie)) return false;
  if (!person.nazwisko || !nameRegex.test(person.nazwisko)) return false;

  if (person.dataUrodzenia && !dateRegex.test(person.dataUrodzenia)) return false;
  if (person.miejsceUrodzenia && !nameRegex.test(person.miejsceUrodzenia)) return false;
  if (person.dataZgonu && !dateRegex.test(person.dataZgonu)) return false;
  if (person.miejsceZgonu && !nameRegex.test(person.miejsceZgonu)) return false;
  if (person.ojciecId && !digitRegex.test(person.ojciecId)) return false;
  if (person.matkaId && !digitRegex.test(person.matkaId)) return false;
  if (person.wspolmalzonekId && !digitRegex.test(person.wspolmalzonekId)) return false;

  return true;
}
