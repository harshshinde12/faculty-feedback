const fs = require('fs');
const path = require('path');
const content = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
fs.writeFileSync('env_export.txt', content);
console.log('Env saved to env_export.txt');
