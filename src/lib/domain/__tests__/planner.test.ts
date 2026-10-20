import { describe, it, expect } from 'vitest';
import { calculatePriorityScore, planDay, PlannedTask } from '../planner';

describe('Daily Planner Algorithm', () => {
  const sampleTasks: PlannedTask[] = [
    {
      id: 'task-1',
      title: 'Tarefa Urgente e Atrasada',
      priority: 'urgent',
      difficulty: 'hard',
      estimatedMinutes: 60,
      dueDate: '2026-10-19', // overdue relative to 2026-10-20
      isBlocked: false,
      isCompleted: false,
    },
    {
      id: 'task-2',
      title: 'Tarefa Alta que Vence Hoje',
      priority: 'high',
      difficulty: 'medium',
      estimatedMinutes: 120,
      dueDate: '2026-10-20',
      isBlocked: false,
      isCompleted: false,
    },
    {
      id: 'task-3',
      title: 'Tarefa Bloqueada',
      priority: 'urgent',
      difficulty: 'epic',
      estimatedMinutes: 90,
      dueDate: '2026-10-20',
      isBlocked: true,
      isCompleted: false,
    },
    {
      id: 'task-4',
      title: 'Tarefa Já Concluída',
      priority: 'medium',
      difficulty: 'easy',
      estimatedMinutes: 30,
      isBlocked: false,
      isCompleted: true,
    },
  ];

  it('ranks overdue urgent tasks higher than non-overdue tasks', () => {
    const score1 = calculatePriorityScore(sampleTasks[0], '2026-10-20');
    const score2 = calculatePriorityScore(sampleTasks[1], '2026-10-20');
    // Task 1: 400 (urgent) + 350 (overdue) = 750
    // Task 2: 300 (high) + 200 (due today) = 500
    expect(score1.score).toBe(750);
    expect(score2.score).toBe(500);
    expect(score1.score).toBeGreaterThan(score2.score);
  });

  it('penalizes and isolates blocked tasks', () => {
    const score3 = calculatePriorityScore(sampleTasks[2], '2026-10-20');
    expect(score3.score).toBeLessThan(0);
  });

  it('partitions day plan into fitting budget, exceeding, blocked, and completed', () => {
    // Total available: 150 minutes
    // Task 1 (60 min) fits: 60 min cumulative
    // Task 2 (120 min) exceeds budget: 60 + 120 = 180 > 150 min
    const plan = planDay(sampleTasks, '2026-10-20', 150);

    expect(plan.completedTasks).toHaveLength(1);
    expect(plan.blockedTasks).toHaveLength(1);
    expect(plan.tasksFittingBudget).toHaveLength(1);
    expect(plan.tasksFittingBudget[0].task.id).toBe('task-1');
    expect(plan.tasksExceedingBudget).toHaveLength(1);
    expect(plan.tasksExceedingBudget[0].task.id).toBe('task-2');
  });
});
