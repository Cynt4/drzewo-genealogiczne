import fs from 'fs';
import path from 'path';

async function globalSetup() {
    const source = path.join(__dirname, '../../../data/empty-data.json');
    const destination = path.join(__dirname, '../../../data/test-data.json');

    fs.copyFileSync(source, destination);

    console.log('Test data reset completed');
}

export default globalSetup;