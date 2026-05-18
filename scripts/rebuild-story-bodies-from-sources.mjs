import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { normalizeStoryText } from '../src/lib/normalizeStoryText.mjs';
import { readStory } from './story-import-utils.mjs';

const root = process.cwd();
const incomingDir = path.join(root, 'incoming');
const storiesDir = path.join(root, 'src', 'content', 'stories');

function splitFrontmatter(markdown) {
  const match = markdown.match(/^\s*(---\r?\n[\s\S]*?\r?\n---\r?\n)([\s\S]*)$/);
  if (!match) return { frontmatter: '', body: markdown };
  return { frontmatter: match[1], body: match[2] };
}

function getSourceFile(frontmatter) {
  const match = frontmatter.match(/^sourceFile:\s*"(.+)"\s*$/m);
  return match?.[1]?.replace(/\\"/g, '"').replace(/\\\\/g, '\\') ?? null;
}

function comparable(markdown) {
  return markdown.replace(/\r\n?/g, '\n');
}

async function findSourcePath(sourceFile) {
  const candidates = [path.join(incomingDir, sourceFile), path.join(root, sourceFile)];

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Try the next source location.
    }
  }

  return null;
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
    const { frontmatter } = splitFrontmatter(markdown);
    const sourceFile = getSourceFile(frontmatter);

    if (!sourceFile) {
      console.warn(`Skipped ${filename}: missing sourceFile`);
      continue;
    }

    const sourcePath = await findSourcePath(sourceFile);
    if (!sourcePath) {
      console.warn(`Skipped ${filename}: missing source ${sourceFile}`);
      continue;
    }

    const raw = (await readStory(sourcePath)).trim();
    if (!raw) {
      console.warn(`Skipped ${filename}: empty source ${sourceFile}`);
      continue;
    }

    const rebuilt = `${frontmatter}\n${normalizeStoryText(raw)}\n`;
    if (comparable(rebuilt) !== comparable(markdown)) {
      await fs.writeFile(filePath, rebuilt, 'utf8');
      console.log(`Rebuilt ${filename} from ${sourceFile}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
