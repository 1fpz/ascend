// ==============================================================================
// PROJECT ASCEND — DETERMINISTIC DAILY PLANNER ALGORITHM
// Prioritization, Time Budget Allocation, and Rule-Based Explanations
// ==============================================================================

import { TaskPriority, TaskDifficulty } from './gamification';

export interface PlannedTask {
  id: string;
  title: string;
  priority: TaskPriority;
  difficulty: TaskDifficulty;
  estimatedMinutes: number;
  dueDate?: string | null;
  scheduledDate?: string | null;
  isBlocked: boolean;
  isCompleted: boolean;
  blockingReasons?: string[];
}

export interface PrioritizedTaskResult {
  task: PlannedTask;
  priorityScore: number;
  fitsInBudget: boolean;
  cumulativeMinutes: number;
  explanation: string;
}

export interface DailyPlannerPlan {
  totalEstimatedMinutes: number;
  availableMinutes: number;
  tasksFittingBudget: PrioritizedTaskResult[];
  tasksExceedingBudget: PrioritizedTaskResult[];
  blockedTasks: PrioritizedTaskResult[];
  completedTasks: PrioritizedTaskResult[];
}

/**
 * Computes priority score based on explicit, transparent business weights:
 * - Priority weight: urgent (400), high (300), medium (200), low (100)
 * - Due date urgency:
 *   - Overdue: +350
 *   - Due today: +200
 *   - Due tomorrow: +100
 *   - Due later / none: +0
 * - Blocked penalty: -1000
 */
export function calculatePriorityScore(
  task: PlannedTask,
  targetDateStr: string // YYYY-MM-DD
): { score: number; explanationParts: string[] } {
  let score = 0;
  const parts: string[] = [];

  // Priority base score
  const priorityWeightMap: Record<TaskPriority, number> = {
    urgent: 400,
    high: 300,
    medium: 200,
    low: 100,
  };
  const pWeight = priorityWeightMap[task.priority] || 200;
  score += pWeight;
  parts.push(`Prioridade ${task.priority.toUpperCase()} (+${pWeight})`);

  // Deadline score
  if (task.dueDate) {
    if (task.dueDate < targetDateStr) {
      score += 350;
      parts.push('Prazo atrasado (+350)');
    } else if (task.dueDate === targetDateStr) {
      score += 200;
      parts.push('Vence hoje (+200)');
    } else {
      score += 50;
      parts.push(`Prazo para ${task.dueDate} (+50)`);
    }
  }

  // Blocked penalty
  if (task.isBlocked) {
    score -= 1000;
    parts.push('Bloqueada por dependências pendentes (-1000)');
  }

  return { score, explanationParts: parts };
}

/**
 * Plans the day deterministically given available time budget and tasks.
 */
export function planDay(
  tasks: PlannedTask[],
  targetDateStr: string,
  availableMinutes = 480 // Default 8 hours (480 min)
): DailyPlannerPlan {
  const completed: PrioritizedTaskResult[] = [];
  const blocked: PrioritizedTaskResult[] = [];
  const actionable: { task: PlannedTask; score: number; explanation: string }[] = [];

  for (const t of tasks) {
    if (t.isCompleted) {
      completed.push({
        task: t,
        priorityScore: 0,
        fitsInBudget: true,
        cumulativeMinutes: 0,
        explanation: 'Tarefa já concluída.',
      });
      continue;
    }

    const { score, explanationParts } = calculatePriorityScore(t, targetDateStr);

    if (t.isBlocked) {
      blocked.push({
        task: t,
        priorityScore: score,
        fitsInBudget: false,
        cumulativeMinutes: 0,
        explanation: explanationParts.join(' | '),
      });
      continue;
    }

    actionable.push({
      task: t,
      score,
      explanation: explanationParts.join(' | '),
    });
  }

  // Sort actionable tasks descending by priority score, then by shortest duration
  actionable.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.task.estimatedMinutes - b.task.estimatedMinutes;
  });

  const fitting: PrioritizedTaskResult[] = [];
  const exceeding: PrioritizedTaskResult[] = [];
  let cumulative = 0;
  let totalEstimated = 0;

  for (const item of actionable) {
    const duration = Math.max(5, item.task.estimatedMinutes || 30);
    totalEstimated += duration;

    if (cumulative + duration <= availableMinutes) {
      cumulative += duration;
      fitting.push({
        task: item.task,
        priorityScore: item.score,
        fitsInBudget: true,
        cumulativeMinutes: cumulative,
        explanation: `${item.explanation} | Cabe no tempo diário informado.`,
      });
    } else {
      exceeding.push({
        task: item.task,
        priorityScore: item.score,
        fitsInBudget: false,
        cumulativeMinutes: cumulative + duration,
        explanation: `${item.explanation} | Excede o orçamento de tempo diário (${availableMinutes} min).`,
      });
    }
  }

  return {
    totalEstimatedMinutes: totalEstimated,
    availableMinutes,
    tasksFittingBudget: fitting,
    tasksExceedingBudget: exceeding,
    blockedTasks: blocked,
    completedTasks: completed,
  };
}
