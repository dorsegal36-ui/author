import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ANONYMOUS_AUTHOR,
  DEFAULT_AUTHOR,
  displayAuthorName,
  normalizeAuthorName
} from './storyAuthors.mjs';

test('DEFAULT_AUTHOR is Dor Segal', () => {
  assert.equal(DEFAULT_AUTHOR, 'Dor Segal');
});

test('normalizeAuthorName trims names and collapses whitespace', () => {
  assert.equal(normalizeAuthorName('  Dor   Segal  '), 'Dor Segal');
});

test('normalizeAuthorName returns null for anonymous stories', () => {
  assert.equal(normalizeAuthorName(''), null);
  assert.equal(normalizeAuthorName('   '), null);
  assert.equal(normalizeAuthorName(null), null);
});

test('displayAuthorName displays anonymous stories consistently', () => {
  assert.equal(displayAuthorName(''), ANONYMOUS_AUTHOR);
  assert.equal(displayAuthorName(null), ANONYMOUS_AUTHOR);
});
