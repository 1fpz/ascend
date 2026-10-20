// ==============================================================================
// PROJECT ASCEND — PROGRESS CALCULATION & DEPENDENCY GRAPH ENGINE
// 100% Deterministic — Zero AI
// ==============================================================================

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'archived';

export interface BaseTask {
  id: string;
  status: TaskStatus;
  submissionId?: string | null;
  missionId?: string | null;
  weight?: number;
}

export interface TaskDependency {
  taskId: string;
  dependsOnTaskId: string;
}

export interface SubmissionNode {
  id: string;
  missionId: string;
  parentSubmissionId?: string | null;
  status: TaskStatus;
  tasks?: BaseTask[];
}

/**
 * Checks for circular dependencies in a directed dependency graph.
 * Returns true if a cycle is detected, false otherwise.
 */
export function detectCycle(dependencies: { from: string; to: string }[]): boolean {
  const adj = new Map<string, string[]>();
  const nodes = new Set<string>();

  for (const dep of dependencies) {
    nodes.add(dep.from);
    nodes.add(dep.to);
    const list = adj.get(dep.from) || [];
    list.push(dep.to);
    adj.set(dep.from, list);
  }

  const visited = new Set<string>();
  const recStack = new Set<string>();

  function hasCycleDFS(node: string): boolean {
    visited.add(node);
    recStack.add(node);

    const neighbors = adj.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycleDFS(neighbor)) return true;
      } else if (recStack.has(neighbor)) {
        return true;
      }
    }

    recStack.delete(node);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node)) {
      if (hasCycleDFS(node)) return true;
    }
  }

  return false;
}

/**
 * Evaluates whether a task is blocked by uncompleted dependencies.
 * If blocked, returns the list of blocking task IDs.
 */
export function evaluateTaskBlockedState(
  taskId: string,
  dependencies: TaskDependency[],
  taskStatuses: Map<string, TaskStatus>
): { isBlocked: boolean; blockingTaskIds: string[] } {
  const blockingTaskIds: string[] = [];

  for (const dep of dependencies) {
    if (dep.taskId === taskId) {
      const depStatus = taskStatuses.get(dep.dependsOnTaskId);
      if (depStatus !== 'completed') {
        blockingTaskIds.push(dep.dependsOnTaskId);
      }
    }
  }

  return {
    isBlocked: blockingTaskIds.length > 0,
    blockingTaskIds,
  };
}

/**
 * Calculates deterministic progress percentage (0 - 100) for a set of tasks.
 * Accounts for weights if provided.
 */
export function calculateTasksProgress(tasks: BaseTask[]): number {
  const activeTasks = tasks.filter((t) => t.status !== 'archived');
  if (activeTasks.length === 0) return 0;

  let totalWeight = 0;
  let completedWeight = 0;

  for (const task of activeTasks) {
    const weight = Math.max(1, task.weight ?? 1);
    totalWeight += weight;
    if (task.status === 'completed') {
      completedWeight += weight;
    }
  }

  if (totalWeight === 0) return 0;
  return Math.round((completedWeight / totalWeight) * 100);
}

/**
 * Calculates overall mission progress from its submissions and direct tasks.
 */
export function calculateMissionProgress(
  submissionsProgress: number[],
  directTasks: BaseTask[]
): number {
  const parts: number[] = [];

  if (submissionsProgress.length > 0) {
    const avgSubmissions =
      submissionsProgress.reduce((sum, p) => sum + p, 0) / submissionsProgress.length;
    parts.push(avgSubmissions);
  }

  if (directTasks.length > 0) {
    const tasksProg = calculateTasksProgress(directTasks);
    parts.push(tasksProg);
  }

  if (parts.length === 0) return 0;
  const result = parts.reduce((sum, p) => sum + p, 0) / parts.length;
  return Math.round(result);
}
