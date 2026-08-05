import fs from 'node:fs/promises';
import path from 'node:path';
import { slugify } from './story-import-utils.mjs';

const dir = path.resolve('src/content/stories');
const files = await fs.readdir(dir);

for (const file of files) {
  if (file.startsWith('story-') && file.endsWith('.md')) {
    const filePath = path.join(dir, file);
    const content = await fs.readFile(filePath, 'utf8');
    const match = content.match(/title:\s*"([^"]+)"/);
    if (match) {
      const title = match[1];
      const newSlug = slugify(title);
      const newFile = `${newSlug}.md`;
      console.log(`Renaming ${file} -> ${newFile}`);
      await fs.rename(filePath, path.join(dir, newFile));
    }
  }
}
