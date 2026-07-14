import fs from 'fs';
import path from 'path';

async function globalSetup() {
    const dataDir = path.join(__dirname, '../../../data');
    const source = path.join(dataDir, 'empty-data.json');
    const destination = path.join(dataDir, 'test-data.json');

    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true});
        console.log('Utworzono brakujący folder data/');
    }

    if (!fs.existsSync(source)) {
        fs.writeFileSync(source, '[]', 'utf8');
        console.log('Utworzono brakujący czysty plik: empty-data.json');
    }

    fs.copyFileSync(source, destination);
    console.log('Test data reset completed');
}

export default globalSetup;