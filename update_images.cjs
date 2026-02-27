const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'new_images');
const destDir = path.join(__dirname, 'public');

// Clear existing png files in public directory
const existingFiles = fs.readdirSync(destDir);
let deletedCount = 0;
for (const file of existingFiles) {
  if (file.endsWith('.png')) {
    fs.unlinkSync(path.join(destDir, file));
    deletedCount++;
  }
}
console.log(`Deleted ${deletedCount} old images from ${destDir}`);

// Copy new files
const newFiles = fs.readdirSync(srcDir);
let copiedCount = 0;
for (const file of newFiles) {
  if (file.endsWith('.png')) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    copiedCount++;
  }
}
console.log(`Copied ${copiedCount} new images from ${srcDir} to ${destDir}`);
