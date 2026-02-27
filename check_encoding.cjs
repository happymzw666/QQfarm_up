const fs = require('fs');
const files = fs.readdirSync('/public');
for (const file of files) {
  if (file.includes('金')) {
    console.log(file, Buffer.from(file).toString('hex'));
  }
}
