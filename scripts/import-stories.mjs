import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { normalizeStoryText } from '../src/lib/normalizeStoryText.mjs';
import {
  detectLanguage,
  readStory,
  slugify,
  supportedStoryExtensions,
  yamlEscape
} from './story-import-utils.mjs';

const root = process.cwd();
const outputDir = path.join(root, 'src', 'content', 'stories');
const sourceArg = process.argv[2] || '.';
const sourceDir = path.resolve(root, sourceArg);

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  const files = entries
    .filter(
      (entry) =>
        entry.isFile() && supportedStoryExtensions.has(path.extname(entry.name).toLowerCase())
    )
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const today = new Date().toISOString().slice(0, 10);
  const seen = new Set();

  for (const filename of files) {
    const filePath = path.join(sourceDir, filename);
    const stats = await fs.stat(filePath);
    const title = path.basename(filename, path.extname(filename));
    const raw = (await readStory(filePath)).trim();
    if (!raw) {
      console.warn(`Skipped empty story: ${filename}`);
      continue;
    }

    const language = detectLanguage(filename, raw);
    let slug = slugify(title);
    while (seen.has(slug)) slug = `${slug}-copy`;
    seen.add(slug);
    const outputPath = path.join(outputDir, `${slug}.md`);

    try {
      await fs.access(outputPath);
      console.warn(`Skipped existing story: ${slug}.md`);
      continue;
    } catch {
      // File does not exist yet; import it below.
    }

    const body = normalizeStoryText(raw);
    const writtenAt = stats.mtime.toISOString().slice(0, 10);
    const markdown = `---\ntitle: "${yamlEscape(title)}"\nlanguage: "${language}"\nwrittenAt: "${writtenAt}"\npublishedAt: "${today}"\ndraft: false\nsourceFile: "${yamlEscape(filename)}"\n---\n\n${body}\n`;

    await fs.writeFile(outputPath, markdown, 'utf8');
    console.log(`Imported ${filename} -> ${slug}.md`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
