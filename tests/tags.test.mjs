import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeTag,
  normalizeTagKey,
  buildTagReverseIndex,
} from './dist/barrel.mjs';

test('sanitizeTag converts spaces to hyphens', () => {
  assert.equal(sanitizeTag('data engineering'), 'data-engineering');
  assert.equal(sanitizeTag('self awareness'), 'self-awareness');
});

test('sanitizeTag strips disallowed punctuation', () => {
  assert.equal(sanitizeTag('  weird@@!! '), 'weird');
  assert.equal(sanitizeTag('a/b_c-d'), 'a/b_c-d');
});

test('sanitizeTag preserves unicode letters', () => {
  assert.equal(sanitizeTag('já tem'), 'já-tem');
});

test('sanitizeTag collapses repeated and edge hyphens', () => {
  assert.equal(sanitizeTag('a   b'), 'a-b');
  assert.equal(sanitizeTag('-lead-trail-'), 'lead-trail');
});

test('sanitizeTag falls back to "unknown" when empty', () => {
  assert.equal(sanitizeTag('!!!'), 'unknown');
  assert.equal(sanitizeTag(''), 'unknown');
});

test('normalizeTagKey treats separators and case as equivalent', () => {
  assert.equal(normalizeTagKey('Data Engineering'), 'data engineering');
  assert.equal(normalizeTagKey('data-engineering'), 'data engineering');
  assert.equal(normalizeTagKey('data_engineering'), 'data engineering');
});

test('buildTagReverseIndex maps normalized names to ids', () => {
  const idx = buildTagReverseIndex({ t1: 'Data Engineering', t2: 'focus' });
  assert.equal(idx['data engineering'], 't1');
  assert.equal(idx['focus'], 't2');
});
