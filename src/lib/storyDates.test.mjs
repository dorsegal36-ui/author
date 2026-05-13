import assert from 'node:assert/strict';
import test from 'node:test';
import { formatWrittenYear } from './storyDates.mjs';

test('formatWrittenYear displays the year from the original document date', () => {
  assert.equal(formatWrittenYear(new Date('2024-02-09T11:35:58')), 'Written in 2024');
});
