import { copyFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const distPath = resolve(__dirname, '../dist/public');

console.log('🚀 Preparing deployment files in:', distPath);

try {
  // 1. Create .nojekyll
  writeFileSync(join(distPath, '.nojekyll'), '');
  console.log('✅ Created .nojekyll');

  // 2. Create 404.html (copy of index.html) for SPA routing support
  copyFileSync(join(distPath, 'index.html'), join(distPath, '404.html'));
  console.log('✅ Created 404.html from index.html');

  console.log('✨ Build ready for GitHub Pages!');
} catch (err) {
  console.error('❌ Error preparing deployment:', err);
  process.exit(1);
}
