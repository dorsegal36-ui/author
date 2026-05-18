import test from 'node:test';
import assert from 'node:assert/strict';
import { storyMatchesSearch } from './storySearch.mjs';

test('matches a story by title regardless of case', () => {
  assert.equal(
    storyMatchesSearch(
      { title: 'Viena Waits for You', author: 'Dor Segal' },
      'viena'
    ),
    true
  );
});

test('matches a story by author regardless of extra spaces', () => {
  assert.equal(
    storyMatchesSearch(
      { title: 'Acorde F', author: 'Dor Segal' },
      '  dor   segal  '
    ),
    true
  );
});

test('does not match unrelated title or author text', () => {
  assert.equal(
    storyMatchesSearch(
      { title: 'Un piano', author: 'Anonymous' },
      'nostalgia'
    ),
    false
  );
});

test('empty queries show every story', () => {
  assert.equal(
    storyMatchesSearch(
      { title: 'Un piano', author: 'Anonymous' },
      '   '
    ),
    true
  );
});
