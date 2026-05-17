export const COMMENT_LIMITS = {
  authorMax: 80,
  bodyMax: 2000,
  storySlugMax: 160
};

function normalizeWhitespace(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

export function displayAuthorName(authorName) {
  const normalized = normalizeWhitespace(authorName);
  return normalized || 'Anonymous';
}

export function normalizeCommentInput({ storySlug, authorName, body }) {
  const normalizedSlug = normalizeWhitespace(storySlug);
  const normalizedAuthor = normalizeWhitespace(authorName);
  const normalizedBody = String(body ?? '').trim();

  if (!normalizedSlug) {
    return { ok: false, error: 'This story cannot accept comments right now.' };
  }

  if (normalizedSlug.length > COMMENT_LIMITS.storySlugMax) {
    return { ok: false, error: 'This story cannot accept comments right now.' };
  }

  if (normalizedAuthor.length > COMMENT_LIMITS.authorMax) {
    return {
      ok: false,
      error: `Names must be ${COMMENT_LIMITS.authorMax} characters or fewer.`
    };
  }

  if (!normalizedBody) {
    return { ok: false, error: 'Write a comment before submitting.' };
  }

  if (normalizedBody.length > COMMENT_LIMITS.bodyMax) {
    return {
      ok: false,
      error: `Comments must be ${COMMENT_LIMITS.bodyMax} characters or fewer.`
    };
  }

  return {
    ok: true,
    value: {
      story_slug: normalizedSlug,
      author_name: normalizedAuthor || null,
      body: normalizedBody
    }
  };
}
