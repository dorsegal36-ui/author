import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeStoryText } from './normalizeStoryText.mjs';

test('normalizeStoryText preserves explicit paragraph breaks', () => {
  const raw = 'First paragraph stays together.\n\nSecond paragraph stays together.';

  assert.equal(normalizeStoryText(raw), raw);
});

test('normalizeStoryText turns hard-wrapped prose into longer readable paragraphs', () => {
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
    'I came home late and the apartment felt smaller than usual. There were dishes in the sink and a message waiting for me. I did not want to answer it. I walked around the room instead. The light from the street made everything look borrowed. By midnight I understood that I was not going to sleep. So I sat at the table and wrote down what had happened.'
  );
});

test('normalizeStoryText does not invent paragraph breaks inside a long source paragraph', () => {
  const raw = [
    'The first sentence opens the same continuous paragraph.',
    'The second sentence keeps developing that same thought.',
    'The third sentence still belongs to the same source paragraph.',
    'The fourth sentence should not be split away by length.',
    'The fifth sentence continues without a blank line in the source.',
    'The sixth sentence is still part of the same reading unit.',
    'The seventh sentence should remain attached to the others.',
    'The eighth sentence makes the paragraph long enough to expose the bug.',
    'The ninth sentence is not a new paragraph just because it is late.',
    'The tenth sentence continues the source paragraph.',
    'The eleventh sentence closes the source paragraph.'
  ].join('\n');

  assert.equal(
    normalizeStoryText(raw),
    'The first sentence opens the same continuous paragraph. The second sentence keeps developing that same thought. The third sentence still belongs to the same source paragraph. The fourth sentence should not be split away by length. The fifth sentence continues without a blank line in the source. The sixth sentence is still part of the same reading unit. The seventh sentence should remain attached to the others. The eighth sentence makes the paragraph long enough to expose the bug. The ninth sentence is not a new paragraph just because it is late. The tenth sentence continues the source paragraph. The eleventh sentence closes the source paragraph.'
  );
});

test('normalizeStoryText preserves short line-based text', () => {
  const raw = 'first line\nsecond line\nthird line';

  assert.equal(normalizeStoryText(raw), raw);
});

test('normalizeStoryText can rebalance short prose paragraphs into longer reading blocks', () => {
  const raw = [
    'First short paragraph has a sentence.',
    '',
    'Second short paragraph continues the same scene.',
    '',
    'Third short paragraph still belongs with the same thought.',
    '',
    'Fourth short paragraph completes the reading block.'
  ].join('\n');

  assert.equal(
    normalizeStoryText(raw, { rebalanceParagraphs: true }),
    'First short paragraph has a sentence. Second short paragraph continues the same scene. Third short paragraph still belongs with the same thought. Fourth short paragraph completes the reading block.'
  );
});
