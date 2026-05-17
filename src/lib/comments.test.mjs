import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COMMENT_LIMITS,
  displayAuthorName,
  normalizeCommentInput
} from './comments.mjs';

test('displayAuthorName uses Anonymous for missing names', () => {
  assert.equal(displayAuthorName(''), 'Anonymous');
  assert.equal(displayAuthorName('   '), 'Anonymous');
  assert.equal(displayAuthorName(null), 'Anonymous');
});

test('normalizeCommentInput trims valid author and body', () => {
  const result = normalizeCommentInput({
    storySlug: 'el-peor-enemigo',
    authorName: '  Dana  ',
    body: '  A sharp ending.  '
  });

  assert.deepEqual(result, {
    ok: true,
    value: {
      story_slug: 'el-peor-enemigo',
      author_name: 'Dana',
      body: 'A sharp ending.'
    }
  });
});

test('normalizeCommentInput stores blank author as null', () => {
  const result = normalizeCommentInput({
    storySlug: 'el-peor-enemigo',
    authorName: '',
    body: 'I liked this.'
  });

  assert.equal(result.ok, true);
  assert.equal(result.value.author_name, null);
});

test('normalizeCommentInput rejects blank body', () => {
  const result = normalizeCommentInput({
    storySlug: 'el-peor-enemigo',
    authorName: 'Dana',
    body: '   '
  });

  assert.deepEqual(result, {
    ok: false,
    error: 'Write a comment before submitting.'
  });
});

test('normalizeCommentInput rejects overlong body', () => {
  const result = normalizeCommentInput({
    storySlug: 'el-peor-enemigo',
    authorName: 'Dana',
    body: 'x'.repeat(COMMENT_LIMITS.bodyMax + 1)
  });

  assert.deepEqual(result, {
    ok: false,
    error: `Comments must be ${COMMENT_LIMITS.bodyMax} characters or fewer.`
  });
});
