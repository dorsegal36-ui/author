import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('global CSS keeps hidden elements hidden after component display rules', () => {
  const css = readFileSync(new URL('../styles/global.css', import.meta.url), 'utf8');

  assert.match(css, /\[hidden\]\s*{[^}]*display:\s*none\s*!important/i);
});
