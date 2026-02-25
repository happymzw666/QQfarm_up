import fs from 'fs';
import path from 'path';

const jsFile = fs.readdirSync('./dist/assets').find(f => f.endsWith('.js'));
const jsCode = fs.readFileSync(path.join('./dist/assets', jsFile), 'utf8');

try {
  // We can't fully evaluate React code in Node without a DOM, but we can try to find obvious syntax errors or top-level throws.
  // Actually, let's just use a headless browser or JSDOM.
} catch (e) {
  console.error(e);
}
