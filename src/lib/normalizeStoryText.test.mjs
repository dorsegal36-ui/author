import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeStoryText } from './normalizeStoryText.mjs';

test('normalizeStoryText preserves explicit paragraph breaks', () => {
  const raw = 'First paragraph stays together.\n\nSecond paragraph stays together.';

  assert.equal(normalizeStoryText(raw), raw);
});

test('normalizeStoryText turns hard-wrapped prose into readable paragraphs', () => {
  const raw = [
    'I came home late and the apartment felt smaller than usual.',
    'There were dishes in the sink and a message waiting for me.',
    'I did not want to answer it. I walked around the room instead.',
    'The light from the street made everything look borrowed.',
    'By midnight I understood that I was not going to sleep.',
    'So I sat at the table and wrote down what had happened.'
  ].join('\n');

  assert.equal(
    normalizeStoryText(raw),
    [
      'I came home late and the apartment felt smaller than usual. There were dishes in the sink and a message waiting for me. I did not want to answer it.',
      'I walked around the room instead. The light from the street made everything look borrowed. By midnight I understood that I was not going to sleep.',
      'So I sat at the table and wrote down what had happened.'
    ].join('\n\n')
  );
});

test('normalizeStoryText preserves short line-based text', () => {
  const raw = 'first line\nsecond line\nthird line';

  assert.equal(normalizeStoryText(raw), raw);
});
