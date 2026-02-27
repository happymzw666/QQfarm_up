const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'temp_repo');
const destDir = path.join(__dirname, 'src', 'data');

fs.copyFileSync(path.join(srcDir, 'seed_mapping.json'), path.join(destDir, 'seed_mapping.json'));
fs.copyFileSync(path.join(srcDir, 'seed-shop-merged-export.json'), path.join(destDir, 'seeds.json'));
fs.copyFileSync(path.join(srcDir, 'Plant.json'), path.join(destDir, 'Plant.json'));

console.log('Copied data files');
