import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.resolve(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace relative imports
  if (content.includes('../shared/firebase')) {
    content = content.replace(/\.\.\/\.\.\/\.\.\/shared\/firebase/g, '@/lib/firebase');
    content = content.replace(/\.\.\/\.\.\/shared\/firebase/g, '@/lib/firebase');
    content = content.replace(/\.\.\/shared\/firebase/g, '@/lib/firebase');
    changed = true;
  }

  // Replace alias imports
  if (content.includes('@/shared/firebase')) {
    content = content.replace(/@\/shared\/firebase/g, '@/lib/firebase');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
  }
});
