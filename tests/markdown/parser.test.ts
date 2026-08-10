import { describe, it, expect } from 'vitest';
import { parseMarkdown } from '../../src/markdown/parser';
import { generateMarkdown } from '../../src/markdown/generator';
import fs from 'fs';
import path from 'path';

// Use a dynamic import or path mapping so this doesn't conflict with obsidian plugins
const mockFilePath = path.join(__dirname, '../mocks/habitica-fullsync.md');
const MOCK_MARKDOWN = fs.readFileSync(mockFilePath, 'utf8');

describe('Markdown Parser & Generator', () => {
    
    it('should parse the mock markdown file correctly', () => {
        const state = parseMarkdown(MOCK_MARKDOWN);
        
        expect(state.dailies.length).toBe(1);
        expect(state.todos.length).toBe(1);
        expect(state.habits.length).toBe(1);
        expect(state.rewards.length).toBe(1);

        const daily = state.dailies[0];
        expect(daily.text).toBe('Send 3 curriculums');
        expect(daily.completed).toBe(false);
        expect(daily.tags).toContain('job-search');
        expect(daily.notes).toBe('Check LinkedIn and Gupy websites');
        expect(daily.id).toBe('eecfbc5d-981a-4c4d-8613-4661b21e7c8a');
        expect(daily.priority).toBe(2); // 'high' -> 2
        expect(daily.frequency).toBe('weekly');
        
        expect(daily.checklist?.length).toBe(3);
        expect(daily.checklist?.[1].completed).toBe(true);

        const todo = state.todos[0];
        expect(todo.completed).toBe(true);
        expect(todo.id).toBe('097a0025-759c-4eef-8381-60ea14966b5c');
        expect(todo.priority).toBe(2);
        
        const habit = state.habits[0];
        expect(habit.up).toBe(true);
        expect(habit.down).toBe(true);

        const reward = state.rewards[0];
        expect(reward.value).toBe(20);
        expect(reward.priority).toBe(1);
    });

    it('should generate markdown identical to the input state', () => {
        const state = parseMarkdown(MOCK_MARKDOWN);
        
        const generated = generateMarkdown(state);
        
        // Since formatting might slightly differ (e.g., extra newlines between sections), 
        // we can just re-parse the generated markdown and ensure the state is identical.
        const reParsedState = parseMarkdown(generated);
        
        expect(reParsedState).toEqual(state);
    });

});
