import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSyncFile } from './dist/barrel.mjs';

// ── basic classification ──

test('classifies creatable, managed, and checked task lines', () => {
  const content = [
    '## To-Dos',
    '- [ ] Buy milk',
    '- [ ] Write docs [id:: abc-123]',    // managed (has id, not checked)
    '- [x] Walk dog [id:: def-456]',      // checked (checked + id + no scored)
  ].join('\n');

  const entries = parseSyncFile(content);
  assert.equal(entries.length, 3);

  const [creatable, managed, checked] = entries;
  assert.equal(creatable.kind, 'creatable');
  assert.equal(creatable.section, 'To-Dos');
  assert.equal(creatable.raw, '- [ ] Buy milk');

  assert.equal(managed.kind, 'managed');
  assert.equal(managed.id, 'abc-123');
  assert.equal(managed.section, 'To-Dos');

  assert.equal(checked.kind, 'checked');
  assert.equal(checked.id, 'def-456');
  assert.equal(checked.section, 'To-Dos');
});

// ── scored lines are excluded ──

test('excludes scored checked lines', () => {
  const content = [
    '## To-Dos',
    '- [x] Done [id:: ghi-789] %%scored%%',
  ].join('\n');

  const entries = parseSyncFile(content);
  assert.equal(entries.length, 0);
});

// ── group subsection skipping ──

test('excludes task lines inside ### Group Tasks', () => {
  const content = [
    '## To-Dos',
    '- [ ] Should create',
    '### Group Tasks',
    '- [ ] Should NOT create', // inside group subsection, no id
    '- [ ] Group managed [id:: grp-1]', // inside group subsection, has id
  ].join('\n');

  const entries = parseSyncFile(content);
  // only the first creatable line should be included
  assert.equal(entries.length, 1);
  assert.equal(entries[0].kind, 'creatable');
  assert.equal(entries[0].raw, '- [ ] Should create');
});

// ── section tracking across headings ──

test('tracks sections correctly across heading changes', () => {
  const content = [
    '## To-Dos',
    '- [ ] Todo item',
    '## Dailies',
    '- [ ] Daily item',
    '### Group Tasks',
    '## Habits',
    '- [ ] Habit item',
  ].join('\n');

  const entries = parseSyncFile(content);
  assert.equal(entries.length, 3);
  assert.equal(entries[0].section, 'To-Dos');
  assert.equal(entries[1].section, 'Dailies');
  assert.equal(entries[2].section, 'Habits');
});

// ── empty file ──

test('returns empty array for files with no task lines', () => {
  assert.deepEqual(parseSyncFile(''), []);
  assert.deepEqual(parseSyncFile('## To-Dos\n_No tasks found._\n'), []);
});

// ── skips placeholder ──

test('skips _No tasks found._ placeholder', () => {
  const content = [
    '## To-Dos',
    '_No tasks found._',
    '- [ ] Real task',
  ].join('\n');

  const entries = parseSyncFile(content);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].raw, '- [ ] Real task');
});

// ── lineNumbers are correct ──

test('records correct 0-based line numbers', () => {
  const content = [
    '# Header',
    '',
    '## To-Dos',
    '- [ ] Task one',
    '- [ ] Task two [id:: t2]',
  ].join('\n');

  const entries = parseSyncFile(content);
  assert.equal(entries[0].lineNumber, 3); // '## To-Dos' is line 2 (0-based), first task at line 3
  assert.equal(entries[1].lineNumber, 4);
});

// ── managed tasks (unchecked with id) ──

test('classifies unchecked lines with id as managed', () => {
  const content = [
    '## To-Dos',
    '- [ ] Existing [id:: exist-1] [priority:: medium]',
  ].join('\n');

  const entries = parseSyncFile(content);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].kind, 'managed');
  assert.equal(entries[0].id, 'exist-1');
});

// ── nested content gathered ──

test('gathers nested notes and checklist items via scanner', () => {
  const content = [
    '## To-Dos',
    '- [ ] Parent task',
    '  > [!note]',
    '  > Some note',
    '  - [ ] Subtask one',
    '  - [x] Subtask two [subId:: sub-1]',
  ].join('\n');

  const entries = parseSyncFile(content);
  assert.equal(entries.length, 1);

  const entry = entries[0];
  assert.ok(entry.notes.includes('Some note'));
  assert.equal(entry.checklistItems.length, 2);
  assert.equal(entry.checklistItems[0].text, 'Subtask one');
  assert.equal(entry.checklistItems[0].checked, false);
  assert.equal(entry.checklistItems[1].text, 'Subtask two [subId:: sub-1]');
  assert.equal(entry.checklistItems[1].checked, true);
  assert.equal(entry.checklistItems[1].subId, 'sub-1');
});
