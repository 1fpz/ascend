export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskDifficulty = 'easy' | 'medium' | 'hard' | 'epic';
export type TaskType =
  | 'simple'
  | 'reading'
  | 'bible_reading'
  | 'study'
  | 'habit'
  | 'workout'
  | 'meditation'
  | 'numeric_goal'
  | 'timed'
  | 'checklist'
  | 'evidence';

export type AttributeType = 'discipline' | 'knowledge' | 'health' | 'execution' | 'consistency';

export interface Profile {
  id: string;
  fullName: string;
  avatarUrl?: string;
  timezone: string;
  lifeVision?: string;
  createdAt: string;
}

export interface CharacterProfile {
  userId: string;
  level: number;
  currentXp: number;
  totalXp: number;
  discipline: number;
  knowledge: number;
  health: number;
  execution: number;
  consistency: number;
}

export interface LifeArea {
  id: string;
  userId: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  sortOrder: number;
  isArchived: boolean;
}

export interface Mission {
  id: string;
  userId: string;
  areaId?: string | null;
  title: string;
  description?: string;
  purpose?: string;
  successCriteria?: string;
  priority: TaskPriority;
  difficulty: TaskDifficulty;
  startDate: string;
  dueDate?: string | null;
  status: 'draft' | 'in_progress' | 'completed' | 'archived' | 'paused';
  calculatedProgress: number;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  userId: string;
  missionId: string;
  parentSubmissionId?: string | null;
  title: string;
  description?: string;
  sortOrder: number;
  status: TaskStatus;
  calculatedProgress: number;
  createdAt: string;
}

export interface TaskItem {
  id: string;
  userId: string;
  missionId?: string | null;
  submissionId?: string | null;
  title: string;
  description?: string;
  taskType: TaskType;
  priority: TaskPriority;
  difficulty: TaskDifficulty;
  estimatedMinutes: number;
  dueDate?: string | null;
  scheduledDate?: string | null;
  isSideTask: boolean;
  status: TaskStatus;
  completedAt?: string | null;
  config: Record<string, unknown>;
  resultData: Record<string, unknown>;
  createdAt: string;
}

export interface HabitItem {
  id: string;
  userId: string;
  areaId?: string | null;
  title: string;
  description?: string;
  frequencyType: 'daily' | 'specific_days' | 'weekly_count';
  frequencyDays: number[]; // 1-7
  targetCount: number;
  currentStreak: number;
  longestStreak: number;
  isActive: boolean;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  userId: string;
  habitId: string;
  logDate: string;
  completed: boolean;
  count: number;
  notes?: string;
}

export interface XpLedgerEntry {
  id: string;
  userId: string;
  sourceType: string;
  sourceId: string;
  xpAmount: number;
  attribute: AttributeType;
  reason: string;
  idempotencyKey: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  category: AttributeType | 'milestone';
  xpReward: number;
  unlockedAt?: string | null;
}
