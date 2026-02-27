const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const mappingPath = path.join(__dirname, 'src', 'data', 'seed_mapping.json');

const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

for (let i = 0; i < mapping.length; i++) {
  const entry = mapping[i];
  const oldFileName = entry.fileName;
  
  // Remove Chinese characters and full-width parentheses
  let newFileName = oldFileName.replace(/[\u4e00-\u9fa5（）]/g, '');
  // Clean up multiple underscores
  newFileName = newFileName.replace(/_+/g, '_');
  
  if (oldFileName !== newFileName) {
    const oldPath = path.join(publicDir, oldFileName);
    const newPath = path.join(publicDir, newFileName);
    
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      console.log(`Renamed: ${oldFileName} -> ${newFileName}`);
    } else {
      console.log(`File not found: ${oldFileName}`);
    }
    
    entry.fileName = newFileName;
  }
}

// Also check if there are any other files in public that need renaming
const files = fs.readdirSync(publicDir);
for (const file of files) {
  if (file.endsWith('.png')) {
    let newFileName = file.replace(/[\u4e00-\u9fa5（）]/g, '').replace(/_+/g, '_');
    if (file !== newFileName) {
      const oldPath = path.join(publicDir, file);
      const newPath = path.join(publicDir, newFileName);
      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        console.log(`Renamed unmapped: ${file} -> ${newFileName}`);
      }
    }
  }
}

fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2), 'utf-8');
console.log('Updated seed_mapping.json');
