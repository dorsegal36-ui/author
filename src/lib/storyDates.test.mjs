import assert from 'node:assert/strict';
import test from 'node:test';
import { formatWrittenYear } from './storyDates.mjs';

test('formatWrittenYear displays the month and year from the original document date', () => {
  assert.equal(formatWrittenYear(new Date('2024-02-09T11:35:58')), 'Written in February 2024');
});
