import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import mammoth from 'mammoth';
import AdmZip from 'adm-zip';
import { XMLParser } from 'fast-xml-parser';
import { DEFAULT_AUTHOR, normalizeAuthorName } from '../src/lib/storyAuthors.mjs';

const hebrewPattern = /[\u0590-\u05ff]/;
const spanishPattern = /[áéíóúñü¿¡ÁÉÍÓÚÑÜÃ¡Ã©Ã­Ã³ÃºÃ±Ã¼Â¿Â¡ÃÃ‰ÃÃ“ÃšÃ‘Ãœ]/;

export const supportedStoryExtensions = new Set(['.txt', '.docx', '.odt']);

export function slugify(value) {
  const slug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w\s\u0590-\u05ff\-]+/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  if (slug) return slug;

  const hash = crypto.createHash('sha1').update(value).digest('hex').slice(0, 10);
  return `story-${hash}`;
}

export function yamlEscape(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function createStoryMarkdown({
  title,
  language,
  author = DEFAULT_AUTHOR,
  writtenAt,
  publishedAt,
  sourceFile,
  body
}) {
  const normalizedAuthor = normalizeAuthorName(author);
  const authorLine = normalizedAuthor
    ? `author: "${yamlEscape(normalizedAuthor)}"\n`
    : 'author: null\n';

  return `---\ntitle: "${yamlEscape(title)}"\nlanguage: "${language}"\n${authorLine}writtenAt: "${writtenAt}"\npublishedAt: "${publishedAt}"\ndraft: true\nsourceFile: "${yamlEscape(sourceFile)}"\n---\n\n${body}\n`;
}

export function detectLanguage(filename, text) {
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

  return paragraphs.join('\n\n').trim();
}

export async function readStory(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.txt') return readTxt(filePath);
  if (ext === '.docx') return readDocx(filePath);
  if (ext === '.odt') return readOdt(filePath);
  throw new Error(`Unsupported extension: ${ext}`);
}
