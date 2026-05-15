import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { normalizeStoryText } from '../src/lib/normalizeStoryText.mjs';
import {
  detectLanguage,
  readStory,
  slugify,
  yamlEscape
} from './story-import-utils.mjs';

const root = process.cwd();
const incomingDir = path.join(root, 'incoming');
const storiesDir = path.join(root, 'src', 'content', 'stories');
const target = process.argv.slice(2).join(' ').trim();

function splitFrontmatter(markdown) {
  const match = markdown.match(/^\s*(---\r?\n[\s\S]*?\r?\n---\r?\n)([\s\S]*)$/);
  if (!match) return { frontmatter: '', body: markdown };
  return { frontmatter: match[1], body: match[2] };
}

function setFrontmatterValue(frontmatter, key, value) {
  const escaped = yamlEscape(value);
  const pattern = new RegExp(`^${key}:.*$`, 'm');
  if (pattern.test(frontmatter)) {
    return frontmatter.replace(pattern, `${key}: "${escaped}"`);
  }
  return frontmatter.replace(/\r?\n---\r?\n$/, `\n${key}: "${escaped}"\n---\n`);
}

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
  const { frontmatter } = splitFrontmatter(existing);
  const stats = await fs.stat(filePath);
  const body = normalizeStoryText(raw);
  const updatedFrontmatter = setFrontmatterValue(
    setFrontmatterValue(
      setFrontmatterValue(frontmatter, 'sourceFile', filename),
      'writtenAt',
      stats.mtime.toISOString().slice(0, 10)
    ),
    'language',
    detectLanguage(filename, raw)
  );

  await fs.writeFile(outputPath, `${updatedFrontmatter}\n${body}\n`, 'utf8');
  console.log(`Updated ${slug}.md from ${filename}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
