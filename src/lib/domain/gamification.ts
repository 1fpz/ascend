// ==============================================================================
// PROJECT ASCEND — GAMIFICATION & XP LEDGER DOMAIN
// Deterministic Level Progression & Attribute Point Distribution
// ==============================================================================

export type TaskDifficulty = 'easy' | 'medium' | 'hard' | 'epic';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type AttributeType = 'discipline' | 'knowledge' | 'health' | 'execution' | 'consistency';

export interface CharacterAttributes {
  discipline: number;
  knowledge: number;
  health: number;
  execution: number;
  consistency: number;
}

export interface CharacterState {
  level: number;
  currentXp: number;
  totalXp: number;
  attributes: CharacterAttributes;
}

// XP Difficulty Base Table
const DIFFICULTY_XP: Record<TaskDifficulty, number> = {
  easy: 25,
  medium: 50,
  hard: 100,
  epic: 250,
};

// Priority Multiplier
const PRIORITY_MULTIPLIER: Record<TaskPriority, number> = {
  low: 1.0,
  medium: 1.1,
  high: 1.25,
  urgent: 1.4,
};

/**
 * Calculates deterministic XP reward for completing a task.
 */
export function calculateTaskXp(
  difficulty: TaskDifficulty,
  priority: TaskPriority,
  estimatedMinutes = 30
): number {
  const base = DIFFICULTY_XP[difficulty] || 50;
  const mult = PRIORITY_MULTIPLIER[priority] || 1.0;
  // Time bonus: 1 XP per 10 minutes, capped at 30 bonus XP
  const timeBonus = Math.min(30, Math.floor(Math.max(0, estimatedMinutes) / 10));
  return Math.round(base * mult + timeBonus);
}

/**
 * Deterministic Level Calculation:
 * XP required for level L: 100 * (L ^ 1.6)
 */
export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 100;
  return Math.round(100 * Math.pow(level, 1.6));
}

/**
 * Computes current level and progress to next level from total XP.
 */
export function getLevelProgressFromTotalXp(totalXp: number): {
  level: number;
  currentLevelXp: number;
  xpForNextLevel: number;
  progressPercent: number;
} {
  let level = 1;
  let remainingXp = Math.max(0, totalXp);

  while (true) {
    const cost = xpRequiredForLevel(level);
    if (remainingXp < cost) {
      const progressPercent = Math.min(100, Math.round((remainingXp / cost) * 100));
      return {
        level,
        currentLevelXp: remainingXp,
        xpForNextLevel: cost,
        progressPercent,
      };
    }
    remainingXp -= cost;
    level++;
  }
}

/**
 * Attribute contribution map based on task type.
 */
export function getAttributeForTaskType(taskType: string): AttributeType {
  switch (taskType) {
    case 'reading':
    case 'bible_reading':
    case 'study':
      return 'knowledge';
    case 'workout':
      return 'health';
    case 'habit':
    case 'meditation':
      return 'consistency';
    case 'timed':
    case 'numeric_goal':
      return 'discipline';
    case 'simple':
    case 'checklist':
    case 'evidence':
    default:
      return 'execution';
  }
}

/**
 * Generates an idempotent transaction key for XP ledger entries.
 */
export function generateIdempotencyKey(
  sourceType: string,
  sourceId: string,
  action: 'complete' | 'revert'
): string {
  return `${sourceType}:${sourceId}:${action}`;
}
