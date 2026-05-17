import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { normalizeStoryText } from '../src/lib/normalizeStoryText.mjs';
import {
  detectLanguage,
  readStory,
  slugify
} from './story-import-utils.mjs';
import { createUpdatedStoryMarkdown } from './story-update-utils.mjs';

const root = process.cwd();
const incomingDir = path.join(root, 'incoming');
const storiesDir = path.join(root, 'src', 'content', 'stories');
const target = process.argv.slice(2).join(' ').trim();

async function findIncomingFile() {
  const entries = await fs.readdir(incomingDir, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);

  if (!target) {
    throw new Error('Usage: npm run update:story -- "Story filename or slug"');
  }

  const normalizedTarget = target.toLowerCase();
  const match = files.find((filename) => {
    const nameWithoutExt = path.basename(filename, path.extname(filename));
    return (
      filename.toLowerCase() === normalizedTarget ||
      nameWithoutExt.toLowerCase() === normalizedTarget ||
      slugify(nameWithoutExt) === normalizedTarget
    );
  });

  if (!match) throw new Error(`No matching incoming file found for: ${target}`);
  return match;
}

async function main() {
  const filename = await findIncomingFile();
  const filePath = path.join(incomingDir, filename);
  const title = path.basename(filename, path.extname(filename));
  const slug = slugify(title);
  const outputPath = path.join(storiesDir, `${slug}.md`);
  const raw = (await readStory(filePath)).trim();

  if (!raw) throw new Error(`Incoming file is empty: ${filename}`);

  const existing = await fs.readFile(outputPath, 'utf8');
  const body = normalizeStoryText(raw);
  const markdown = createUpdatedStoryMarkdown(existing, {
    body,
    filename,
    language: detectLanguage(filename, raw),
    draft: false
  });

  await fs.writeFile(outputPath, markdown, 'utf8');
  console.log(`Updated ${slug}.md from ${filename}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
