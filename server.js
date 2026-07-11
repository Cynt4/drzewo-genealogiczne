const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = process.env.NODE_ENV === 'test' 
? path.join(__dirname, 'test-data.json')
: path.join(__dirname, 'data-json');
// const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public'))); 

// POBIERANIE Z ZABEZPIECZENIEM
app.get('/api/data', (req, res) => {
    if (!fs.existsSync(DATA_FILE)) {
        return res.json([]);
    }
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data || '[]'));
    } catch (err) {
        // Jeśli JSON jest zepsuty, serwer o tym poinformuje w konsoli!
        console.error("❌ BŁĄD KRYTYCZNY: Plik data.json jest uszkodzony! Sprawdź czy nie brakuje przecinka.");
        console.error(err.message);
        res.status(500).json({ error: "Błąd formatu JSON" });
    }
});

// ZAPISYWANIE
app.post('/api/data', (req, res) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true, message: "Zapisano poprawnie" });
});

app.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`🚀 Serwer działa bezbłędnie!`);
    console.log(`🌍 Otwórz w przeglądarce: http://localhost:${PORT}`);
    console.log(`=================================================\n`);
});