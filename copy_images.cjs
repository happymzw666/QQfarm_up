const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'temp_repo', 'seed_images_named');
const destDir = path.join(__dirname, 'public');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
for (const file of files) {
  fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
}
console.log(`Copied ${files.length} files from ${srcDir} to ${destDir}`);
