// ==============================================================================
// PROJECT ASCEND — UNIFIED DOMAIN STORE & REPOSITORY
// Deterministic Business Logic & Persistence Layer
// ==============================================================================

import {
  Mission,
  Submission,
  TaskItem,
  HabitItem,
  HabitLog,
  CharacterProfile,
  XpLedgerEntry,
  Achievement,
  LifeArea,
} from '../types';
import { calculateMissionProgress, calculateTasksProgress } from '../domain/progress';
import {
  calculateTaskXp,
  getAttributeForTaskType,
  getLevelProgressFromTotalXp,
  generateIdempotencyKey,
} from '../domain/gamification';
import { PRESET_MISSION_TEMPLATES } from '../catalog/templates';

export interface AppState {
  lifeAreas: LifeArea[];
  missions: Mission[];
  submissions: Submission[];
  tasks: TaskItem[];
  habits: HabitItem[];
  habitLogs: HabitLog[];
  character: CharacterProfile;
  xpLedger: XpLedgerEntry[];
  achievements: Achievement[];
}

const INITIAL_LIFE_AREAS: LifeArea[] = [
  { id: 'area-career', userId: 'user-default', name: 'Carreira', icon: 'Briefcase', color: '#3b82f6', sortOrder: 1, isArchived: false },
  { id: 'area-business', userId: 'user-default', name: 'Negócios', icon: 'TrendingUp', color: '#10b981', sortOrder: 2, isArchived: false },
  { id: 'area-health', userId: 'user-default', name: 'Saúde & Físico', icon: 'Activity', color: '#ef4444', sortOrder: 3, isArchived: false },
  { id: 'area-knowledge', userId: 'user-default', name: 'Conhecimento', icon: 'BookOpen', color: '#8b5cf6', sortOrder: 4, isArchived: false },
  { id: 'area-spirituality', userId: 'user-default', name: 'Espiritualidade', icon: 'Sun', color: '#f59e0b', sortOrder: 5, isArchived: false },
  { id: 'area-finance', userId: 'user-default', name: 'Finanças', icon: 'DollarSign', color: '#06b6d4', sortOrder: 6, isArchived: false },
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-first-task',
    code: 'first_task',
    title: 'Primeiro Passo do Conquistador',
    description: 'Concluiu sua primeira tarefa no Project Ascend.',
    icon: 'Award',
    category: 'execution',
    xpReward: 50,
  },
  {
    id: 'ach-first-mission',
    code: 'first_mission',
    title: 'Comandante de Missões',
    description: 'Concluiu integralmente sua primeira missão primária.',
    icon: 'ShieldCheck',
    category: 'milestone',
    xpReward: 200,
  },
  {
    id: 'ach-streak-master',
    code: 'streak_3',
    title: 'Chama da Constância',
    description: 'Manteve 3 dias seguidos de hábitos concluídos.',
    icon: 'Flame',
    category: 'consistency',
    xpReward: 100,
  },
  {
    id: 'ach-level-2',
    code: 'level_2',
    title: 'Ascensão Inicial',
    description: 'Alcançou o Nível 2 de evolução pessoal.',
    icon: 'Zap',
    category: 'discipline',
    xpReward: 100,
  },
];

const DEFAULT_STATE: AppState = {
  lifeAreas: INITIAL_LIFE_AREAS,
  missions: [
    {
      id: 'mission-seed-1',
      userId: 'user-default',
      areaId: 'area-business',
      title: 'Lançar MVP do Project Ascend',
      description: 'Construir e disponibilizar a primeira versão funcional e estável do SaaS.',
      purpose: 'Alcançar independência financeira e criar um produto de alto impacto.',
      successCriteria: 'Usuários ativos cadastrados e executando planejamento diário sem falhas.',
      priority: 'urgent',
      difficulty: 'epic',
      startDate: '2026-10-20',
      dueDate: '2026-11-30',
      status: 'in_progress',
      calculatedProgress: 33,
      icon: 'Rocket',
      createdAt: '2026-10-20T10:00:00Z',
      updatedAt: '2026-10-20T10:00:00Z',
    },
  ],
  submissions: [
    {
      id: 'sub-seed-1',
      userId: 'user-default',
      missionId: 'mission-seed-1',
      title: 'Arquitetura e Motor Central',
      description: 'Estruturação de banco relacional, cálculo de XP e rotas centrais.',
      sortOrder: 1,
      status: 'completed',
      calculatedProgress: 100,
      createdAt: '2026-10-20T10:00:00Z',
    },
    {
      id: 'sub-seed-2',
      userId: 'user-default',
      missionId: 'mission-seed-1',
      title: 'Interface do Planner e Gamificação',
      description: 'Dashboard, árvore de missões e painel diário.',
      sortOrder: 2,
      status: 'in_progress',
      calculatedProgress: 0,
      createdAt: '2026-10-20T10:00:00Z',
    },
  ],
  tasks: [
    {
      id: 'task-seed-1',
      userId: 'user-default',
      missionId: 'mission-seed-1',
      submissionId: 'sub-seed-1',
      title: 'Configurar Migrations e RLS no PostgreSQL',
      description: 'Garantir isolamento estrito de dados e integridade referencial.',
      taskType: 'simple',
      priority: 'urgent',
      difficulty: 'hard',
      estimatedMinutes: 60,
      dueDate: '2026-10-20',
      scheduledDate: '2026-10-20',
      isSideTask: false,
      status: 'completed',
      completedAt: '2026-10-20T11:00:00Z',
      config: {},
      resultData: {},
      createdAt: '2026-10-20T10:00:00Z',
    },
    {
      id: 'task-seed-2',
      userId: 'user-default',
      missionId: 'mission-seed-1',
      submissionId: 'sub-seed-2',
      title: 'Implementar Smart Task de Leitura Bíblica',
      description: 'Leitura de Provérbios 3 e reflexão sobre diligência.',
      taskType: 'bible_reading',
      priority: 'high',
      difficulty: 'medium',
      estimatedMinutes: 25,
      dueDate: '2026-10-20',
      scheduledDate: '2026-10-20',
      isSideTask: false,
      status: 'pending',
      config: { passageKey: 'proverbios-3' },
      resultData: {},
      createdAt: '2026-10-20T10:00:00Z',
    },
    {
      id: 'task-seed-3',
      userId: 'user-default',
      missionId: 'mission-seed-1',
      submissionId: 'sub-seed-2',
      title: 'Sessão de Foco: Treino Físico Intenso',
      description: 'Musculação focada em peitoral e tríceps.',
      taskType: 'workout',
      priority: 'medium',
      difficulty: 'medium',
      estimatedMinutes: 45,
      dueDate: '2026-10-20',
      scheduledDate: '2026-10-20',
      isSideTask: false,
      status: 'pending',
      config: {},
      resultData: {},
      createdAt: '2026-10-20T10:00:00Z',
    },
  ],
  habits: [
    {
      id: 'habit-seed-1',
      userId: 'user-default',
      areaId: 'area-health',
      title: 'Beber 3L de Água',
      description: 'Hidratação constante durante o dia de trabalho.',
      frequencyType: 'daily',
      frequencyDays: [1, 2, 3, 4, 5, 6, 7],
      targetCount: 1,
      currentStreak: 2,
      longestStreak: 5,
      isActive: true,
      createdAt: '2026-10-18T10:00:00Z',
    },
    {
      id: 'habit-seed-2',
      userId: 'user-default',
      areaId: 'area-knowledge',
      title: 'Leitura Técnica (30 min)',
      description: 'Estudo focado sem notificações.',
      frequencyType: 'daily',
      frequencyDays: [1, 2, 3, 4, 5, 6, 7],
      targetCount: 1,
      currentStreak: 1,
      longestStreak: 3,
      isActive: true,
      createdAt: '2026-10-19T10:00:00Z',
    },
  ],
  habitLogs: [
    {
      id: 'hlog-1',
      userId: 'user-default',
      habitId: 'habit-seed-1',
      logDate: '2026-10-19',
      completed: true,
      count: 1,
    },
  ],
  character: {
    userId: 'user-default',
    level: 1,
    currentXp: 50,
    totalXp: 50,
    discipline: 12,
    knowledge: 11,
    health: 10,
    execution: 14,
    consistency: 11,
  },
  xpLedger: [
    {
      id: 'ledger-seed-1',
      userId: 'user-default',
      sourceType: 'task_completion',
      sourceId: 'task-seed-1',
      xpAmount: 50,
      attribute: 'execution',
      reason: 'Conclusão de tarefa: Configurar Migrations e RLS no PostgreSQL',
      idempotencyKey: 'task:task-seed-1:complete',
      createdAt: '2026-10-20T11:00:00Z',
    },
  ],
  achievements: [
    {
      ...INITIAL_ACHIEVEMENTS[0],
      unlockedAt: '2026-10-20T11:00:00Z',
    },
    ...INITIAL_ACHIEVEMENTS.slice(1),
  ],
};

const STORAGE_KEY = 'project_ascend_store_v1';

export class AppRepository {
  private state: AppState;

  constructor() {
    this.state = this.loadInitialState();
  }

  private loadInitialState(): AppState {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...structuredClone(DEFAULT_STATE), ...parsed };
        }
      } catch {
        // Fallback to default state
      }
    }
    return structuredClone(DEFAULT_STATE);
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch {
        // Ignore storage write errors
      }
    }
  }

  public getState(): AppState {
    return this.state;
  }

  // --- Missions ---
  public getMissions(): Mission[] {
    return this.state.missions;
  }

  public getMissionById(id: string): Mission | undefined {
    return this.state.missions.find((m) => m.id === id);
  }

  public createMission(mission: Omit<Mission, 'id' | 'calculatedProgress' | 'createdAt' | 'updatedAt'>): Mission {
    const newMission: Mission = {
      ...mission,
      id: `mission-${Date.now()}`,
      calculatedProgress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.missions.push(newMission);
    this.persist();
    return newMission;
  }

  // --- Submissions ---
  public getSubmissionsByMission(missionId: string): Submission[] {
    return this.state.submissions
      .filter((s) => s.missionId === missionId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public createSubmission(sub: Omit<Submission, 'id' | 'calculatedProgress' | 'createdAt'>): Submission {
    const newSub: Submission = {
      ...sub,
      id: `sub-${Date.now()}`,
      calculatedProgress: 0,
      createdAt: new Date().toISOString(),
    };
    this.state.submissions.push(newSub);
    this.persist();
    return newSub;
  }

  // --- Tasks ---
  public getTasks(): TaskItem[] {
    return this.state.tasks;
  }

  public getTaskById(id: string): TaskItem | undefined {
    return this.state.tasks.find((t) => t.id === id);
  }

  public createTask(task: Omit<TaskItem, 'id' | 'createdAt' | 'status'> & { status?: TaskItem['status'] }): TaskItem {
    const newTask: TaskItem = {
      ...task,
      status: task.status || 'pending',
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.tasks.push(newTask);
    this.recalculateMissionProgress(newTask.missionId);
    this.persist();
    return newTask;
  }

  /**
   * Completes a task idempotently, awards XP, updates attributes and checks achievements.
   */
  public completeTask(taskId: string, resultData?: Record<string, unknown>): { task: TaskItem; xpAwarded: number; leveledUp: boolean } {
    const task = this.state.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error(`Tarefa ${taskId} não encontrada.`);

    const idempotencyKey = generateIdempotencyKey('task', taskId, 'complete');
    const existingLedger = this.state.xpLedger.find((l) => l.idempotencyKey === idempotencyKey);

    let xpAwarded = 0;
    let leveledUp = false;

    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    if (resultData) {
      task.resultData = { ...task.resultData, ...resultData };
    }

    if (!existingLedger) {
      xpAwarded = calculateTaskXp(task.difficulty, task.priority, task.estimatedMinutes);
      const attribute = getAttributeForTaskType(task.taskType);

      // Record in XP Ledger
      this.state.xpLedger.unshift({
        id: `ledger-${Date.now()}`,
        userId: task.userId,
        sourceType: 'task_completion',
        sourceId: task.id,
        xpAmount: xpAwarded,
        attribute,
        reason: `Conclusão: ${task.title}`,
        idempotencyKey,
        createdAt: new Date().toISOString(),
      });

      // Update Character Profile
      const prevLevel = this.state.character.level;
      const newTotalXp = this.state.character.totalXp + xpAwarded;
      const levelProgress = getLevelProgressFromTotalXp(newTotalXp);

      this.state.character.totalXp = newTotalXp;
      this.state.character.currentXp = levelProgress.currentLevelXp;
      this.state.character.level = levelProgress.level;
      this.state.character[attribute] += 1;

      if (levelProgress.level > prevLevel) {
        leveledUp = true;
      }

      // Check achievements
      this.evaluateAchievements();
    }

    this.recalculateMissionProgress(task.missionId);
    this.persist();

    return { task, xpAwarded, leveledUp };
  }

  /**
   * Reopens a completed task, deducting awarded XP and adjusting ledger.
   */
  public reopenTask(taskId: string): TaskItem {
    const task = this.state.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error(`Tarefa ${taskId} não encontrada.`);

    const completeKey = generateIdempotencyKey('task', taskId, 'complete');
    const revertKey = generateIdempotencyKey('task', taskId, 'revert');

    const completionLedger = this.state.xpLedger.find((l) => l.idempotencyKey === completeKey);

    if (completionLedger) {
      const xpDeduction = completionLedger.xpAmount;
      const attribute = completionLedger.attribute;

      this.state.xpLedger.unshift({
        id: `ledger-${Date.now()}`,
        userId: task.userId,
        sourceType: 'task_reopened',
        sourceId: task.id,
        xpAmount: -xpDeduction,
        attribute,
        reason: `Reabertura: ${task.title}`,
        idempotencyKey: revertKey,
        createdAt: new Date().toISOString(),
      });

      const newTotalXp = Math.max(0, this.state.character.totalXp - xpDeduction);
      const levelProg = getLevelProgressFromTotalXp(newTotalXp);

      this.state.character.totalXp = newTotalXp;
      this.state.character.currentXp = levelProg.currentLevelXp;
      this.state.character.level = levelProg.level;
      this.state.character[attribute] = Math.max(10, this.state.character[attribute] - 1);
    }

    task.status = 'pending';
    task.completedAt = null;

    this.recalculateMissionProgress(task.missionId);
    this.persist();

    return task;
  }

  // --- Habits ---
  public getHabits(): HabitItem[] {
    return this.state.habits;
  }

  public getHabitLogs(dateStr: string): HabitLog[] {
    return this.state.habitLogs.filter((l) => l.logDate === dateStr);
  }

  public toggleHabitLog(habitId: string, dateStr: string): { habit: HabitItem; completed: boolean } {
    const habit = this.state.habits.find((h) => h.id === habitId);
    if (!habit) throw new Error(`Hábito ${habitId} não encontrado.`);

    const existingIndex = this.state.habitLogs.findIndex(
      (l) => l.habitId === habitId && l.logDate === dateStr
    );

    let completed = false;

    if (existingIndex >= 0) {
      this.state.habitLogs.splice(existingIndex, 1);
      habit.currentStreak = Math.max(0, habit.currentStreak - 1);
      completed = false;
    } else {
      this.state.habitLogs.push({
        id: `hlog-${Date.now()}`,
        userId: habit.userId,
        habitId,
        logDate: dateStr,
        completed: true,
        count: 1,
      });
      habit.currentStreak += 1;
      if (habit.currentStreak > habit.longestStreak) {
        habit.longestStreak = habit.currentStreak;
      }
      completed = true;

      // Award consistency XP
      const idempotencyKey = `habit:${habitId}:${dateStr}`;
      if (!this.state.xpLedger.some((l) => l.idempotencyKey === idempotencyKey)) {
        this.state.xpLedger.unshift({
          id: `ledger-${Date.now()}`,
          userId: habit.userId,
          sourceType: 'habit_completion',
          sourceId: habit.id,
          xpAmount: 20,
          attribute: 'consistency',
          reason: `Hábito diário: ${habit.title}`,
          idempotencyKey,
          createdAt: new Date().toISOString(),
        });
        this.state.character.consistency += 1;
        this.state.character.totalXp += 20;
        const prog = getLevelProgressFromTotalXp(this.state.character.totalXp);
        this.state.character.currentXp = prog.currentLevelXp;
        this.state.character.level = prog.level;
      }
    }

    this.evaluateAchievements();
    this.persist();
    return { habit, completed };
  }

  // --- Template Cloning ---
  public cloneTemplate(templateId: string): Mission {
    const template = PRESET_MISSION_TEMPLATES.find((t) => t.id === templateId);
    if (!template) throw new Error(`Trilha de modelo ${templateId} não encontrada.`);

    const newMissionId = `mission-cloned-${Date.now()}`;
    const newMission: Mission = {
      id: newMissionId,
      userId: 'user-default',
      title: template.title,
      description: template.description,
      priority: 'high',
      difficulty: template.difficulty,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + template.estimatedDurationDays * 86400000).toISOString().split('T')[0],
      status: 'in_progress',
      calculatedProgress: 0,
      icon: template.icon,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.missions.unshift(newMission);

    // Clone Submissions & Tasks
    let subOrder = 1;
    for (const subTpl of template.submissions) {
      const subId = `sub-cloned-${Date.now()}-${subOrder}`;
      const newSub: Submission = {
        id: subId,
        userId: 'user-default',
        missionId: newMissionId,
        title: subTpl.title,
        description: subTpl.description,
        sortOrder: subOrder++,
        status: 'pending',
        calculatedProgress: 0,
        createdAt: new Date().toISOString(),
      };
      this.state.submissions.push(newSub);

      for (const taskTpl of subTpl.tasks) {
        const taskId = `task-cloned-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const newTask: TaskItem = {
          id: taskId,
          userId: 'user-default',
          missionId: newMissionId,
          submissionId: subId,
          title: taskTpl.title,
          description: taskTpl.description,
          taskType: taskTpl.taskType,
          priority: taskTpl.priority,
          difficulty: taskTpl.difficulty,
          estimatedMinutes: taskTpl.estimatedMinutes,
          isSideTask: false,
          status: 'pending',
          config: {},
          resultData: {},
          createdAt: new Date().toISOString(),
        };
        this.state.tasks.push(newTask);
      }
    }

    this.persist();
    return newMission;
  }

  // --- Recalculate Mission Progress ---
  private recalculateMissionProgress(missionId?: string | null) {
    if (!missionId) return;
    const mission = this.state.missions.find((m) => m.id === missionId);
    if (!mission) return;

    const missionSubmissions = this.state.submissions.filter((s) => s.missionId === missionId);
    const submissionsProgressList: number[] = [];

    for (const sub of missionSubmissions) {
      const subTasks = this.state.tasks.filter((t) => t.submissionId === sub.id);
      const subProg = calculateTasksProgress(subTasks);
      sub.calculatedProgress = subProg;
      sub.status = subProg === 100 ? 'completed' : subProg > 0 ? 'in_progress' : 'pending';
      submissionsProgressList.push(subProg);
    }

    const directTasks = this.state.tasks.filter(
      (t) => t.missionId === missionId && (!t.submissionId || t.submissionId === '')
    );

    const overallProgress = calculateMissionProgress(submissionsProgressList, directTasks);
    mission.calculatedProgress = overallProgress;
    if (overallProgress === 100) {
      mission.status = 'completed';
    } else if (mission.status === 'completed' && overallProgress < 100) {
      mission.status = 'in_progress';
    }
  }

  // --- Achievements Evaluation ---
  private evaluateAchievements() {
    const completedTasksCount = this.state.tasks.filter((t) => t.status === 'completed').length;
    const completedMissionsCount = this.state.missions.filter((m) => m.status === 'completed').length;
    const maxStreak = Math.max(0, ...this.state.habits.map((h) => h.currentStreak));
    const level = this.state.character.level;

    for (const ach of this.state.achievements) {
      if (ach.unlockedAt) continue;

      let unlock = false;
      if (ach.code === 'first_task' && completedTasksCount >= 1) unlock = true;
      if (ach.code === 'first_mission' && completedMissionsCount >= 1) unlock = true;
      if (ach.code === 'streak_3' && maxStreak >= 3) unlock = true;
      if (ach.code === 'level_2' && level >= 2) unlock = true;

      if (unlock) {
        ach.unlockedAt = new Date().toISOString();
        // Award achievement XP
        this.state.xpLedger.unshift({
          id: `ledger-ach-${Date.now()}`,
          userId: 'user-default',
          sourceType: 'achievement',
          sourceId: ach.id,
          xpAmount: ach.xpReward,
          attribute: ach.category === 'milestone' ? 'execution' : ach.category,
          reason: `Conquista desbloqueada: ${ach.title}`,
          idempotencyKey: `achievement:${ach.code}:unlocked`,
          createdAt: new Date().toISOString(),
        });
        this.state.character.totalXp += ach.xpReward;
        const prog = getLevelProgressFromTotalXp(this.state.character.totalXp);
        this.state.character.currentXp = prog.currentLevelXp;
        this.state.character.level = prog.level;
      }
    }
  }
}

// Singleton repository instance for client/server execution
let repoInstance: AppRepository | null = null;

export function getRepository(): AppRepository {
  if (!repoInstance) {
    repoInstance = new AppRepository();
  }
  return repoInstance;
}
