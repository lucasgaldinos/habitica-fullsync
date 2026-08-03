import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseTaskLine,
  sectionToType,
  isValidDateString,
  buildTagReverseIndex,
} from './dist/barrel.mjs';

const reverse = buildTagReverseIndex({ t1: 'data engineering', t2: 'focus' });

test('sectionToType maps headings to task types', () => {
  assert.equal(sectionToType('To-Dos'), 'todo');
  assert.equal(sectionToType('Dailies'), 'daily');
  assert.equal(sectionToType('Habits'), 'habit');
  assert.equal(sectionToType('Rewards'), 'reward');
  assert.equal(sectionToType('Nonsense'), undefined);
});

test('isValidDateString rejects impossible dates', () => {
  assert.equal(isValidDateString('2026-02-31'), false);
  assert.equal(isValidDateString('2026-13-01'), false);
  assert.equal(isValidDateString('2026-6-1'), false);
  assert.equal(isValidDateString('2026-06-01'), true);
});

test('parses title, type, priority, due, and known tags', () => {
  const p = parseTaskLine(
    '- [ ] New task #focus #data-engineering [priority:: high] [due:: 2026-06-01]',
    'To-Dos', reverse, '', [],
  );
  assert.equal(p.text, 'New task');
  assert.equal(p.type, 'todo');
  assert.equal(p.priority, 2);
  assert.equal(p.date, '2026-06-01');
  assert.deepEqual([...p.tagIds].sort(), ['t1', 't2']);
  assert.deepEqual(p.newTagNames, []);
});

test('excludes reserved type tags and queues unknown tags for creation', () => {
  const p = parseTaskLine('- [ ] Stretch #daily #newtag', 'Habits', reverse, '', []);
  assert.equal(p.type, 'habit');
  assert.deepEqual(p.tagIds, []);
  assert.deepEqual(p.newTagNames, ['newtag']);
});

test('maps daily [due::] to startDate + frequency, not date', () => {
  const p = parseTaskLine('- [ ] Meditate [due:: 2026-06-02]', 'Dailies', reverse, '', []);
  assert.equal(p.startDate, '2026-06-02');
  assert.equal(p.frequency, 'daily');
  assert.equal(p.date, undefined);
});

test('daily without a due date still gets a default frequency', () => {
  const p = parseTaskLine('- [ ] Meditate', 'Dailies', reverse, '', []);
  assert.equal(p.frequency, 'daily');
  assert.equal(p.startDate, undefined);
});

test('rejects an invalid due date (leaves date unset)', () => {
  const p = parseTaskLine('- [ ] Bad [due:: 2026-02-31]', 'To-Dos', reverse, '', []);
  assert.equal(p.date, undefined);
});

test('passes through notes and checklist items', () => {
  const items = [{ text: 'sub1', checked: false }, { text: 'sub2', checked: true, subId: 'abc' }];
  const p = parseTaskLine('- [ ] Has stuff', 'To-Dos', reverse, 'note text', items);
  assert.equal(p.notes, 'note text');
  assert.deepEqual(p.checklistItems, items);
});

test('returns empty text for a line with no title content', () => {
  const p = parseTaskLine('- [ ] #focus [priority:: low]', 'To-Dos', reverse, '', []);
  assert.equal(p.text, '');
});

test('deduplicates tags that normalize to the same key', () => {
  const p = parseTaskLine('- [ ] T #focus #Focus', 'To-Dos', reverse, '', []);
  assert.deepEqual(p.tagIds, ['t2']);
});
