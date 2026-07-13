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
        console.error("❌ BŁĄD KRYTYCZNY: Uszkodzony format danych.");
        res.status(500).json({ error: "Błąd formatu danych JSON" });
    }
});

// POST DATA
app.post('/api/data', (req, res) => {
    const payload = req.body;

    //Walidacja architektury
    if (!payload || !Array.isArray(payload)) {
        return res.status(400).json({
            error: "Bad request",
            message: "Przesłane dane muszą być tablicą obiektów reprezentujących osoby."
        });
    };

    //Walidacja biznesowa
for (const person of payload) {
    if (!person.imie || !person.nazwisko) {
        return res.status(422).json({
            error: "Unprocessable Entity",
            message: "Każda osoba w drzewie musi posiadać wartość dla wymaganych pól 'imię' i 'nazwisko'." // W tekście dla ludzi ogonki mogą być!
        });
    }
}
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
        res.json({ success: true, message: "Zapisano poprawnie" });
    } catch (err) {
        res.status(500).json({ error: "Błąd zapisu na serwerze"})
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Serwer nasłuchuje na bazie danych: data/${TARGET_FILE}`);
});