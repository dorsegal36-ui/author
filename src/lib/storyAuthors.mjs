export const DEFAULT_AUTHOR = 'Dor Segal';
export const ANONYMOUS_AUTHOR = 'Anonymous';

export function normalizeAuthorName(authorName) {
  const normalized = String(authorName ?? '').trim().replace(/\s+/g, ' ');
  return normalized || null;
}

export function displayAuthorName(authorName) {
  return normalizeAuthorName(authorName) || ANONYMOUS_AUTHOR;
}
