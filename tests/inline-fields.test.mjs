import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseInlineFields,
  extractId,
  extractCompletionDate,
  extractSubId,
  stripInlineFields,
  hasScoredMarker,
  stripScoredMarker,
  buildInlineField,
} from './dist/barrel.mjs';

// ── parseInlineFields ──

test('parseInlineFields extracts all fields and returns cleaned text', () => {
  const { fields, text } = parseInlineFields(
    '- [ ] Buy milk [priority:: high] [due:: 2026-06-01] [id:: abc-123]',
  );
  assert.equal(fields.get('priority'), 'high');
  assert.equal(fields.get('due'), '2026-06-01');
  assert.equal(fields.get('id'), 'abc-123');
  assert.equal(fields.size, 3);
  assert.equal(text, '- [ ] Buy milk');
});

test('parseInlineFields lowercases keys', () => {
  const { fields } = parseInlineFields('[Priority:: high]');
  assert.equal(fields.get('priority'), 'high');
});

test('parseInlineFields returns empty map and unchanged text when no fields present', () => {
  const { fields, text } = parseInlineFields('- [ ] Plain task');
  assert.equal(fields.size, 0);
  assert.equal(text, '- [ ] Plain task');
});

test('parseInlineFields collapses extra whitespace in cleaned text', () => {
  const { text } = parseInlineFields('- [ ]   Buy   milk   [priority:: high]');
  assert.equal(text, '- [ ] Buy milk');
});

// ── extractId ──

test('extractId returns the id value', () => {
  assert.equal(extractId('- [ ] Task [id:: abc-123]'), 'abc-123');
});

test('extractId returns undefined when absent', () => {
  assert.equal(extractId('- [ ] Task [priority:: high]'), undefined);
});

// ── extractCompletionDate ──

test('extractCompletionDate returns YYYY-MM-DD', () => {
  assert.equal(
    extractCompletionDate('- [x] Done [completion:: 2026-06-01] %%scored%%'),
    '2026-06-01',
  );
});

test('extractCompletionDate returns undefined for non-date', () => {
  assert.equal(extractCompletionDate('- [x] Done [completion:: today]'), undefined);
});

// ── extractSubId ──

test('extractSubId returns the subId value', () => {
  assert.equal(extractSubId('  - [x] step [subId:: uuid-here]'), 'uuid-here');
});

test('extractSubId returns undefined when absent', () => {
  assert.equal(extractSubId('  - [x] step'), undefined);
});

// ── stripInlineFields ──

test('stripInlineFields removes all field tokens (preserving raw spacing)', () => {
  const result = stripInlineFields('- [ ] Task [priority:: low] [due:: 2026-01-01]');
  assert.ok(!result.includes('[priority::'));
  assert.ok(!result.includes('[due::'));
  assert.ok(result.startsWith('- [ ] Task'));
});

test('stripInlineFields preserves text when no fields present', () => {
  assert.equal(stripInlineFields('- [ ] Task'), '- [ ] Task');
});

// ── hasScoredMarker / stripScoredMarker ──

test('hasScoredMarker detects %%scored%%', () => {
  assert.equal(hasScoredMarker('- [x] Task %%scored%%'), true);
  assert.equal(hasScoredMarker('- [x] Task'), false);
});

test('stripScoredMarker removes all %%scored%% tokens', () => {
  assert.equal(
    stripScoredMarker('- [x] Task %%scored%% [id:: abc]'),
    '- [x] Task  [id:: abc]',
  );
});

// ── buildInlineField ──

test('buildInlineField produces a [key:: value] token', () => {
  assert.equal(buildInlineField('id', 'abc-123'), '[id:: abc-123]');
  assert.equal(buildInlineField('priority', 'high'), '[priority:: high]');
  assert.equal(buildInlineField('completion', '2026-06-01'), '[completion:: 2026-06-01]');
  assert.equal(buildInlineField('subId', 'uuid'), '[subId:: uuid]');
});

test('buildInlineField round-trips with extractId', () => {
  const token = buildInlineField('id', 'test-id');
  assert.equal(extractId(token), 'test-id');
});
