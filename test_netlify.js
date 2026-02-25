import { JSDOM } from 'jsdom';
import fs from 'fs';

async function testNetlify() {
  const htmlRes = await fetch('https://lustrous-cucurucho-89db5f.netlify.app/');
  const html = await htmlRes.text();
  
  const dom = new JSDOM(html, {
    runScripts: "dangerously",
    resources: "usable",
    url: "https://lustrous-cucurucho-89db5f.netlify.app/"
  });

  dom.window.onerror = function(msg, source, lineno, colno, error) {
    console.error("JSDOM Error:", msg, error);
  };

  dom.window.addEventListener('error', (event) => {
    console.error("JSDOM Event Error:", event.error);
  });

  setTimeout(() => {
    console.log("Root content:", dom.window.document.getElementById('root').innerHTML);
  }, 3000);
}

testNetlify();
