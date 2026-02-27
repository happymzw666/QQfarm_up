const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'temp_images', 'extracted', 'seed_images_named');
const destDir = path.join(__dirname, 'public');

const files = fs.readdirSync(srcDir);
for (const file of files) {
  // Copy original to public/seed_images_named/
  const namedDestDir = path.join(destDir, 'seed_images_named');
  if (!fs.existsSync(namedDestDir)) {
    fs.mkdirSync(namedDestDir, { recursive: true });
  }
  fs.copyFileSync(path.join(srcDir, file), path.join(namedDestDir, file));

  // Create safe filename and copy to public/
  const safeFileName = file.replace(/_[^_]+_Crop_/, '_Crop_');
  fs.copyFileSync(path.join(srcDir, file), path.join(destDir, safeFileName));
}
console.log('Copied and renamed ' + files.length + ' files.');
