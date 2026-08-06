import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SQLiteStore } from '../src/db/sqlite-store';
import { App } from './mocks/obsidian';
import { HabiticaTask } from '../src/types';

describe('SQLiteStore 3NF ETL Pipeline', () => {
  let store: SQLiteStore;

  beforeEach(async () => {
    // We cast App as any to satisfy the Obsidian App interface requirement
    store = new SQLiteStore(new App() as any);
    await store.init();
  });

  afterEach(async () => {
    await store.close();
  });

  it('lossless serialization: upsert and retrieve a complex task', () => {
    const mockTask: HabiticaTask = {
      id: 'task-123',
      type: 'daily',
      text: 'Test Daily',
      priority: 1.5,
      completed: false,
      notes: 'Some notes',
      date: '2023-10-01',
      up: 5,
      down: 2,
      streak: 10,
      attribute: 'str',
      frequency: 'weekly',
      everyX: 1,
      startDate: '2023-09-01',
      tags: ['tag-1', 'tag-2'],
      repeat: { m: true, t: false, w: true },
      checklist: [
        { id: 'check-1', text: 'Step 1', completed: true },
        { id: 'check-2', text: 'Step 2', completed: false }
      ]
    };
    (mockTask as any).position = 2.5;

    // Insert task
    store.upsertTask(mockTask);

    // Retrieve task
    const retrieved = store.getTaskById('task-123');
    
    // Assert
    expect(retrieved).not.toBeNull();
    if (!retrieved) return;

    expect(retrieved.id).toBe(mockTask.id);
    expect(retrieved.text).toBe(mockTask.text);
    expect(retrieved.priority).toBe(mockTask.priority);
    expect(retrieved.up).toBe(mockTask.up);
    expect(retrieved.tags).toEqual(['tag-1', 'tag-2']);
    expect(retrieved.repeat).toEqual({ m: true, t: false, w: true });
    
    expect(retrieved.checklist?.length).toBe(2);
    expect(retrieved.checklist?.[0].id).toBe('check-1');
    expect(retrieved.checklist?.[0].completed).toBe(true);
    
    expect((retrieved as any).position).toBe(2.5);
  });
});
