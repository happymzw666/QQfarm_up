const https = require('https');
const fs = require('fs');
const path = require('path');

const repoOwner = 'linguo2625469';
const repoName = 'FarmCalc';
const dirPath = 'seed_images_named';
const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${dirPath}`;
const targetDir = path.join(__dirname, 'public');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function main() {
  try {
    console.log(`Fetching directory contents from ${apiUrl}...`);
    const contents = await fetchJson(apiUrl);
    
    if (!Array.isArray(contents)) {
      console.error('Failed to fetch contents:', contents);
      return;
    }

    const files = contents.filter(item => item.type === 'file' && item.name.endsWith('.png'));
    console.log(`Found ${files.length} PNG files. Starting download...`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const destPath = path.join(targetDir, file.name);
      console.log(`[${i + 1}/${files.length}] Downloading ${file.name}...`);
      await downloadFile(file.download_url, destPath);
    }
    
    console.log('All files downloaded successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
