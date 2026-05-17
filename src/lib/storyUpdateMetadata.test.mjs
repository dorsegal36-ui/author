import assert from 'node:assert/strict';
import test from 'node:test';
import { createUpdatedStoryMarkdown } from '../../scripts/story-update-utils.mjs';

test('createUpdatedStoryMarkdown preserves writtenAt and can mark a story ready', () => {
  const existing = `---
title: "I saw my neighbour at the supermarket"
language: "english"
writtenAt: "2026-05-16"
publishedAt: "2026-05-17"
draft: true
sourceFile: "I saw my neighbour at the supermarket.txt"
---

Old body.
`;

  const updated = createUpdatedStoryMarkdown(existing, {
    body: 'Latest body.',
    filename: 'I saw my neighbour at the supermarket.txt',
    language: 'english',
    draft: false
  });

  assert.match(updated, /writtenAt: "2026-05-16"/);
  assert.match(updated, /\ndraft: false\n/);
  assert.match(updated, /Latest body\.\n$/);
});
