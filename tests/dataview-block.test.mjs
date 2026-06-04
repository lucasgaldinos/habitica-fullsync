import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDataviewBlock } from './dist/helpers.mjs';

const SOURCE = 'Habitica/habitica-fullsync';

test('produces a fenced dataview block scoped to the sync file', () => {
  const dv = buildDataviewBlock('todo', SOURCE);
  assert.ok(dv.startsWith('```dataview'));
  assert.ok(dv.trimEnd().endsWith('```'));
  assert.ok(dv.includes(`FROM "${SOURCE}"`));
});

test('to-do block surfaces due and completion columns and sorts by due', () => {
  const dv = buildDataviewBlock('todo', SOURCE);
  assert.ok(dv.includes('Due'));
  assert.ok(dv.includes('Done'));
  assert.ok(dv.includes('SORT item.due ASC'));
  assert.ok(dv.includes('!contains(item.tags, "#daily")'));
});

test('daily block filters on the #daily type tag', () => {
  const dv = buildDataviewBlock('daily', SOURCE);
  assert.ok(dv.includes('contains(item.tags, "#daily")'));
  assert.ok(dv.includes('Next Due'));
});

test('habit and reward blocks expose only a priority column (no due)', () => {
  const habit = buildDataviewBlock('habit', SOURCE);
  const reward = buildDataviewBlock('reward', SOURCE);
  assert.ok(habit.includes('contains(item.tags, "#habit")'));
  assert.ok(!habit.includes('Due'));
  assert.ok(reward.includes('contains(item.tags, "#reward")'));
  assert.ok(!reward.includes('Due'));
});
