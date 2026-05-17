import { yamlEscape } from './story-import-utils.mjs';

export function splitFrontmatter(markdown) {
  const match = markdown.match(/^\s*(---\r?\n[\s\S]*?\r?\n---\r?\n)([\s\S]*)$/);
  if (!match) return { frontmatter: '', body: markdown };
  return { frontmatter: match[1], body: match[2] };
}

export function setFrontmatterValue(frontmatter, key, value, { quote = true } = {}) {
  const normalized = quote ? `"${yamlEscape(value)}"` : String(value);
  const pattern = new RegExp(`^${key}:.*$`, 'm');
  if (pattern.test(frontmatter)) {
    return frontmatter.replace(pattern, `${key}: ${normalized}`);
  }
  return frontmatter.replace(/\r?\n---\r?\n$/, `\n${key}: ${normalized}\n---\n`);
}

export function createUpdatedStoryMarkdown(existingMarkdown, { body, filename, language, draft }) {
  const { frontmatter } = splitFrontmatter(existingMarkdown);
  let updatedFrontmatter = setFrontmatterValue(frontmatter, 'sourceFile', filename);
  updatedFrontmatter = setFrontmatterValue(updatedFrontmatter, 'language', language);

  if (typeof draft === 'boolean') {
    updatedFrontmatter = setFrontmatterValue(updatedFrontmatter, 'draft', draft, { quote: false });
  }

  return `${updatedFrontmatter}\n${body}\n`;
}
