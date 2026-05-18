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

test('createStoryMarkdown defaults new imports to Dor Segal', () => {
  const markdown = createStoryMarkdown({
    title: 'Unfinished story',
    language: 'english',
    writtenAt: '2026-05-17',
    publishedAt: '2026-05-17',
    sourceFile: 'Unfinished story.txt',
    body: 'A story still being reviewed.'
  });

  assert.match(markdown, /\nauthor: "Dor Segal"\n/);
});

test('createStoryMarkdown can mark imported stories as anonymous', () => {
  const markdown = createStoryMarkdown({
    title: 'Anonymous story',
    language: 'english',
    author: '',
    writtenAt: '2026-05-17',
    publishedAt: '2026-05-17',
    sourceFile: 'Anonymous story.txt',
    body: 'A story without a public author.'
  });

  assert.match(markdown, /\nauthor: null\n/);
});
