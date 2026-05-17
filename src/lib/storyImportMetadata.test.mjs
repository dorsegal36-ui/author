import assert from 'node:assert/strict';
import test from 'node:test';
import { createStoryMarkdown } from '../../scripts/story-import-utils.mjs';

test('createStoryMarkdown marks newly imported stories as drafts', () => {
  const markdown = createStoryMarkdown({
    title: 'Unfinished story',
    language: 'english',
    writtenAt: '2026-05-17',
    publishedAt: '2026-05-17',
    sourceFile: 'Unfinished story.txt',
    body: 'A story still being reviewed.'
  });

  assert.match(markdown, /\ndraft: true\n/);
});
