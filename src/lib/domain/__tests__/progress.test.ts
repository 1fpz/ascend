import { describe, it, expect } from 'vitest';
import {
  detectCycle,
  evaluateTaskBlockedState,
  calculateTasksProgress,
  calculateMissionProgress,
} from '../progress';

describe('Progress & Dependency Graph Engine', () => {
  it('detects direct circular dependency (A -> B -> A)', () => {
    const deps = [
      { from: 'task-A', to: 'task-B' },
      { from: 'task-B', to: 'task-A' },
    ];
    expect(detectCycle(deps)).toBe(true);
  });

  it('detects multi-hop cycle (A -> B -> C -> A)', () => {
    const deps = [
      { from: 'task-A', to: 'task-B' },
      { from: 'task-B', to: 'task-C' },
      { from: 'task-C', to: 'task-A' },
    ];
    expect(detectCycle(deps)).toBe(true);
  });

  it('returns false when graph has no cycles (A -> B, A -> C, B -> D, C -> D)', () => {
    const deps = [
      { from: 'task-A', to: 'task-B' },
      { from: 'task-A', to: 'task-C' },
      { from: 'task-B', to: 'task-D' },
      { from: 'task-C', to: 'task-D' },
    ];
    expect(detectCycle(deps)).toBe(false);
  });

  it('evaluates task blocked state correctly', () => {
    const deps = [
      { taskId: 'task-B', dependsOnTaskId: 'task-A' },
      { taskId: 'task-C', dependsOnTaskId: 'task-B' },
    ];
    const statuses = new Map([
      ['task-A', 'completed' as const],
      ['task-B', 'pending' as const],
      ['task-C', 'pending' as const],
    ]);

    const resB = evaluateTaskBlockedState('task-B', deps, statuses);
    expect(resB.isBlocked).toBe(false);
    expect(resB.blockingTaskIds).toHaveLength(0);

    const resC = evaluateTaskBlockedState('task-C', deps, statuses);
    expect(resC.isBlocked).toBe(true);
    expect(resC.blockingTaskIds).toEqual(['task-B']);
  });

  it('calculates tasks progress with weights deterministically', () => {
    const tasks = [
      { id: '1', status: 'completed' as const, weight: 2 },
      { id: '2', status: 'pending' as const, weight: 2 },
    ];
    expect(calculateTasksProgress(tasks)).toBe(50);
  });

  it('ignores archived tasks in progress calculation', () => {
    const tasks = [
      { id: '1', status: 'completed' as const },
      { id: '2', status: 'archived' as const },
    ];
    expect(calculateTasksProgress(tasks)).toBe(100);
  });

  it('calculates composite mission progress correctly', () => {
    const submissionsProgress = [100, 50]; // avg = 75
    const directTasks = [
      { id: '1', status: 'completed' as const },
      { id: '2', status: 'pending' as const },
    ]; // 50%
    // Composite = (75 + 50) / 2 = 62.5 -> 63%
    expect(calculateMissionProgress(submissionsProgress, directTasks)).toBe(63);
  });
});
