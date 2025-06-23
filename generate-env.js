// generate-env.js
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const env = process.env;

const environment = {
  production: 'false',
  urlCenter: env.API_URL_CENTER || '',
  urlBudget: env.API_URL_BUDGET || ''
};

const content = `export const environment = ${JSON.stringify(environment, null, 2)};\n`;

// Crée le dossier s’il n’existe pas
const outputDir = path.resolve(__dirname, 'src/app/env');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Écrit le fichier
fs.writeFileSync(path.join(outputDir, 'env.ts'), content);

console.log('✅ environment.ts généré avec :');
console.log(environment);
