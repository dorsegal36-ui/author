import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import mammoth from 'mammoth';
import AdmZip from 'adm-zip';
import { XMLParser } from 'fast-xml-parser';

const root = process.cwd();
const outputDir = path.join(root, 'src', 'content', 'stories');
const supported = new Set(['.txt', '.docx', '.odt']);

const hebrewPattern = /[\u0590-\u05ff]/;
const spanishPattern = /[áéíóúñü¿¡ÁÉÍÓÚÑÜ]/;

function slugify(value) {
  const latinSlug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  if (latinSlug) return latinSlug;

  const hash = crypto.createHash('sha1').update(value).digest('hex').slice(0, 10);
  return `story-${hash}`;
}

function yamlEscape(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function detectLanguage(filename, text) {
  const sample = `${filename}\n${text.slice(0, 500)}`;
  if (hebrewPattern.test(sample)) return 'hebrew';
  if (spanishPattern.test(sample)) return 'spanish';
  return 'english';
}

async function readTxt(filePath) {
  return fs.readFile(filePath, 'utf8');
}

async function readDocx(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

async function readOdt(filePath) {
  const zip = new AdmZip(filePath);
  const entry = zip.getEntry('content.xml');
  if (!entry) throw new Error('ODT file has no content.xml');

  const xml = entry.getData().toString('utf8');
  const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true,
    textNodeName: '#text'
  });
  const parsed = parser.parse(xml);
  const bodyText = parsed['document-content']?.body?.text;
  const blocks = [bodyText?.h, bodyText?.p].flat().filter(Boolean);
  const paragraphs = [];

  function collectText(node, chunks = []) {
    if (node == null) return;
    if (typeof node === 'string' || typeof node === 'number') {
      chunks.push(String(node));
      return chunks;
    }
    if (Array.isArray(node)) {
      for (const item of node) collectText(item, chunks);
      return chunks;
    }
    if (typeof node === 'object') {
      if (typeof node['#text'] === 'string') chunks.push(node['#text']);
      for (const [key, value] of Object.entries(node)) {
        if (!key.startsWith('@_') && key !== '#text') collectText(value, chunks);
      }
    }
    return chunks;
  }

  for (const block of blocks) {
    const paragraph = collectText(block).join(' ').replace(/\s+/g, ' ').trim();
    if (paragraph) paragraphs.push(paragraph);
  }

  return paragraphs
    .join('\n\n')
    .trim();
}

async function readStory(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.txt') return readTxt(filePath);
  if (ext === '.docx') return readDocx(filePath);
  if (ext === '.odt') return readOdt(filePath);
  throw new Error(`Unsupported extension: ${ext}`);
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && supported.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const today = new Date().toISOString().slice(0, 10);
  const seen = new Set();

  for (const filename of files) {
    const filePath = path.join(root, filename);
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

    const body = raw
      .replace(/\r\n/g, '\n')
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .join('\n\n');

    const writtenAt = stats.mtime.toISOString().slice(0, 10);
    const markdown = `---\ntitle: "${yamlEscape(title)}"\nlanguage: "${language}"\nwrittenAt: "${writtenAt}"\npublishedAt: "${today}"\ndraft: false\nsourceFile: "${yamlEscape(filename)}"\n---\n\n${body}\n`;

    await fs.writeFile(path.join(outputDir, `${slug}.md`), markdown, 'utf8');
    console.log(`Imported ${filename} -> ${slug}.md`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
