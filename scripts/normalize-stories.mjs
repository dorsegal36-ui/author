import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { normalizeStoryText } from '../src/lib/normalizeStoryText.mjs';

const root = process.cwd();
const storiesDir = path.join(root, 'src', 'content', 'stories');

function splitFrontmatter(markdown) {
  const match = markdown.match(/^\s*(---\r?\n[\s\S]*?\r?\n---\r?\n)([\s\S]*)$/);
  if (!match) return { frontmatter: '', body: markdown };
  return { frontmatter: match[1], body: match[2] };
}

async function main() {
  const entries = await fs.readdir(storiesDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  for (const filename of files) {
    const filePath = path.join(storiesDir, filename);
    const markdown = await fs.readFile(filePath, 'utf8');
    const { frontmatter, body } = splitFrontmatter(markdown);
    const normalized = `${frontmatter}\n${normalizeStoryText(body)}\n`;

    if (normalized !== markdown) {
      await fs.writeFile(filePath, normalized, 'utf8');
      console.log(`Normalized ${filename}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
