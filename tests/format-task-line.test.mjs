import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatTaskLine } from './dist/barrel.mjs';

const tagLookup = { t1: 'data engineering', t2: 'focus' };
const TODAY = '2026-05-29';

test('renders sanitized tags, strips heading syntax, adds due', () => {
  const task = {
    id: 'abc', type: 'todo', text: '## Send report', completed: false,
    priority: 2, tags: ['t1', 't2'], notes: '', date: '2026-06-01',
  };
  const out = formatTaskLine(task, tagLookup, TODAY);
  const first = out.split('\n')[0];
  assert.ok(first.startsWith('- [ ] Send report'), 'heading markers stripped');
  assert.ok(first.includes('#data-engineering'), 'tag sanitized');
  assert.ok(first.includes('#focus'));
  assert.ok(first.includes('[id:: abc]'));
  assert.ok(first.includes('[priority:: high]'));
  assert.ok(first.includes('[due:: '), 'todo renders a due field');
});

test('renders notes as a nested callout, one line per segment', () => {
  const task = {
    id: 'n1', type: 'todo', text: 'Task', completed: false, priority: 1,
    tags: [], notes: 'Line one\nLine two',
  };
  const out = formatTaskLine(task, tagLookup, TODAY).split('\n');
  assert.equal(out[1], '  > [!note]');
  assert.equal(out[2], '  > Line one');
  assert.equal(out[3], '  > Line two');
});

test('omits the callout entirely when there are no notes', () => {
  const task = {
    id: 'n2', type: 'todo', text: 'Task', completed: false, priority: 1,
    tags: [], notes: null,
  };
  const out = formatTaskLine(task, tagLookup, TODAY);
  assert.equal(out.split('\n').length, 1);
  assert.ok(!out.includes('[!note]'));
});

test('renders checklist items as nested checkboxes with correct state', () => {
  const task = {
    id: 'c1', type: 'todo', text: 'Task', completed: false, priority: 1, tags: [],
    checklist: [
      { id: 'a', text: 'step a', completed: true },
      { id: 'b', text: 'step b', completed: false },
    ],
  };
  const out = formatTaskLine(task, tagLookup, TODAY);
  assert.ok(out.includes('  - [x] step a'));
  assert.ok(out.includes('  - [ ] step b'));
});

test('preserves multi-line checklist item text with indented continuation', () => {
  const task = {
    id: 'c2', type: 'todo', text: 'Task', completed: false, priority: 1, tags: [],
    checklist: [
      { text: 'First line\n\nContinuation paragraph\n\n## heading\n\n- bullet\n    - nested', completed: false },
    ],
  };
  const out = formatTaskLine(task, tagLookup, TODAY);
  const lines = out.split('\n');
  assert.ok(lines.some(l => l === '  - [ ] First line'), 'first line rendered as checkbox');
  assert.ok(lines.some(l => l === '    Continuation paragraph'), 'continuation indented 4 spaces');
  assert.ok(lines.some(l => l === '    ## heading'), 'heading preserved');
  assert.ok(lines.some(l => l === '    - bullet'), 'bullet preserved');
  assert.ok(lines.some(l => l === '        - nested'), 'nested bullet preserved (6 spaces)');
});

test('does not crash when tags/checklist are absent (reward task)', () => {
  const task = { id: 'r1', type: 'reward', text: 'Coffee', completed: false, priority: 1 };
  const out = formatTaskLine(task, tagLookup, TODAY);
  assert.ok(out.split('\n')[0].includes('#reward'));
});

test('adds completion field for completed non-habit tasks', () => {
  const task = { id: 'd1', type: 'todo', text: 'Done', completed: true, priority: 1, tags: [] };
  const out = formatTaskLine(task, tagLookup, TODAY);
  assert.ok(out.split('\n')[0].includes(`[completion:: ${TODAY}]`));
});
