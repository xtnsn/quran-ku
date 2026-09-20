import fs from 'fs';
import path from 'path';

const wwwDir = path.resolve('www');

// Ensure www exists and is clean
if (fs.existsSync(wwwDir)) {
  fs.rmSync(wwwDir, { recursive: true, force: true });
}
fs.mkdirSync(wwwDir, { recursive: true });

// Items to copy
const itemsToCopy = ['index.html', 'manifest.json', 'sw.js', 'src', 'assets', 'open-app.jpg', 'logo-sekolah.PNG'];

for (const item of itemsToCopy) {
  const srcPath = path.resolve(item);
  const destPath = path.join(wwwDir, item);

  if (fs.existsSync(srcPath)) {
    fs.cpSync(srcPath, destPath, { recursive: true });
    console.log(`Copied ${item} to www/`);
  } else {
    console.warn(`Warning: ${item} not found`);
  }
}

console.log('Build complete: www folder ready for Capacitor');
