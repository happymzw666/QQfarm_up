const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcDir = path.join(__dirname, 'new_images');
const destDir = path.join(__dirname, 'public');

// Unzip the file
try {
  execSync(`unzip -o ${path.join(srcDir, 'seed_images_named.zip')} -d ${srcDir}`);
  console.log('Unzipped successfully.');
} catch (e) {
  console.error('Error unzipping:', e.message);
}

// The unzipped files might be inside a folder named 'seed_images_named'
let actualSrcDir = srcDir;
if (fs.existsSync(path.join(srcDir, 'seed_images_named'))) {
  actualSrcDir = path.join(srcDir, 'seed_images_named');
}

// Copy new files
const newFiles = fs.readdirSync(actualSrcDir);
let copiedCount = 0;
for (const file of newFiles) {
  if (file.endsWith('.png')) {
    fs.copyFileSync(path.join(actualSrcDir, file), path.join(destDir, file));
    copiedCount++;
  }
}
console.log(`Copied ${copiedCount} new images from ${actualSrcDir} to ${destDir}`);
