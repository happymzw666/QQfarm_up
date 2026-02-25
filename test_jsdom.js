import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const html = fs.readFileSync('./dist/index.html', 'utf8');
const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable",
  url: "http://localhost/"
});

dom.window.onerror = function(msg, source, lineno, colno, error) {
  console.error("JSDOM Error:", msg, error);
};

dom.window.addEventListener('error', (event) => {
  console.error("JSDOM Event Error:", event.error);
});

// We need to serve the files so JSDOM can load them.
// Or we can just inject the JS directly.
const jsFile = fs.readdirSync('./dist/assets').find(f => f.endsWith('.js'));
const jsCode = fs.readFileSync(path.join('./dist/assets', jsFile), 'utf8');

const script = dom.window.document.createElement('script');
script.textContent = jsCode;
dom.window.document.body.appendChild(script);

setTimeout(() => {
  console.log("Root content:", dom.window.document.getElementById('root').innerHTML);
}, 2000);
