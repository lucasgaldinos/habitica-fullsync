import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  spliceLineByIndex,
  replaceUniqueLine,
  findLineIndexById,
} from './dist/barrel.mjs';

const sample = [
  '- [ ] Buy milk',
  '- [ ] Buy milk',
  '- [x] Walk dog [id:: abc-123] %%scored%%',
  '- [ ] Write docs [id:: def-456]',
].join('\n');

// ── spliceLineByIndex ──

test('spliceLineByIndex replaces the correct line and verifies match', () => {
  const result = spliceLineByIndex(sample, 2, '- [x] Walk dog [id:: abc-123] %%scored%%', '- [x] Walk dog [id:: abc-123]');
  const lines = result.split('\n');
  assert.equal(lines[2], '- [x] Walk dog [id:: abc-123]');
  // line 1 unchanged
  assert.equal(lines[1], '- [ ] Buy milk');
});

test('spliceLineByIndex throws on mismatch', () => {
  assert.throws(
    () => spliceLineByIndex(sample, 2, 'wrong line', 'new'),
    /mismatch at line 2/,
  );
});

test('spliceLineByIndex throws on out-of-range index', () => {
  assert.throws(
    () => spliceLineByIndex(sample, 99, 'x', 'y'),
    /out of range/,
  );
});

// ── replaceUniqueLine ──

test('replaceUniqueLine replaces a uniquely occurring line', () => {
  const result = replaceUniqueLine(sample, '- [x] Walk dog [id:: abc-123] %%scored%%', '- [x] Walk dog [id:: abc-123]');
  assert.ok(!result.includes('%%scored%%'));
});

test('replaceUniqueLine throws when line not found', () => {
  assert.throws(
    () => replaceUniqueLine(sample, 'nonexistent line', 'x'),
    /not found/,
  );
});

test('replaceUniqueLine throws on ambiguous (duplicate) lines', () => {
  assert.throws(
    () => replaceUniqueLine(sample, '- [ ] Buy milk', 'x'),
    /ambiguous.*2 occurrences/,
  );
});

// ── findLineIndexById ──

test('findLineIndexById returns the 0-based line index', () => {
  assert.equal(findLineIndexById(sample, 'abc-123'), 2);
  assert.equal(findLineIndexById(sample, 'def-456'), 3);
});

test('findLineIndexById returns -1 when not found', () => {
  assert.equal(findLineIndexById(sample, 'nonexistent'), -1);
});
