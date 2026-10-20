import { describe, it, expect, beforeEach } from 'vitest';
import { AppRepository } from '../index';

describe('AppRepository & Business Store', () => {
  let repo: AppRepository;

  beforeEach(() => {
    repo = new AppRepository();
  });

  it('loads initial seed state properly', () => {
    const state = repo.getState();
    expect(state.missions.length).toBeGreaterThan(0);
    expect(state.tasks.length).toBeGreaterThan(0);
    expect(state.habits.length).toBeGreaterThan(0);
    expect(state.character.level).toBeGreaterThanOrEqual(1);
  });

  it('creates and retrieves a new mission', () => {
    const mission = repo.createMission({
      userId: 'user-default',
      title: 'Dominar Arquitetura de Software',
      priority: 'high',
      difficulty: 'epic',
      startDate: '2026-10-20',
      status: 'in_progress',
    });

    expect(mission.id).toBeDefined();
    expect(repo.getMissionById(mission.id)?.title).toBe('Dominar Arquitetura de Software');
  });

  it('completes a task idempotently and awards XP', () => {
    const task = repo.createTask({
      userId: 'user-default',
      title: 'Criar testes determinísticos',
      taskType: 'simple',
      priority: 'urgent',
      difficulty: 'medium',
      estimatedMinutes: 30,
      isSideTask: false,
      config: {},
      resultData: {},
    });

    const initialTotalXp = repo.getState().character.totalXp;

    // Complete task first time
    const res1 = repo.completeTask(task.id);
    expect(res1.task.status).toBe('completed');
    expect(res1.xpAwarded).toBeGreaterThan(0);
    const totalXpAfterFirstComplete = repo.getState().character.totalXp;
    expect(totalXpAfterFirstComplete).toBeGreaterThanOrEqual(initialTotalXp + res1.xpAwarded);

    // Complete task second time (idempotency check)
    const res2 = repo.completeTask(task.id);
    expect(res2.xpAwarded).toBe(0); // No double XP awarded
    expect(repo.getState().character.totalXp).toBe(totalXpAfterFirstComplete);
  });

  it('reopens a completed task and rolls back awarded XP safely', () => {
    const task = repo.createTask({
      userId: 'user-default',
      title: 'Tarefa de Teste Reabertura',
      taskType: 'simple',
      priority: 'medium',
      difficulty: 'easy',
      estimatedMinutes: 20,
      isSideTask: false,
      config: {},
      resultData: {},
    });

    const initialXp = repo.getState().character.totalXp;
    const { xpAwarded } = repo.completeTask(task.id);
    expect(repo.getState().character.totalXp).toBe(initialXp + xpAwarded);

    // Reopen task
    const reopened = repo.reopenTask(task.id);
    expect(reopened.status).toBe('pending');
    expect(repo.getState().character.totalXp).toBe(initialXp);
  });

  it('logs habit occurrences and tracks consecutive streak', () => {
    const habits = repo.getHabits();
    const habit = habits[0];
    const initialStreak = habit.currentStreak;

    // Toggle log for new date
    const res = repo.toggleHabitLog(habit.id, '2026-10-25');
    expect(res.completed).toBe(true);
    expect(res.habit.currentStreak).toBe(initialStreak + 1);

    // Toggle again (uncheck)
    const res2 = repo.toggleHabitLog(habit.id, '2026-10-25');
    expect(res2.completed).toBe(false);
    expect(res2.habit.currentStreak).toBe(initialStreak);
  });

  it('clones a preset template into an independent mission with submissions and tasks', () => {
    const stateBefore = repo.getState();
    const missionsCountBefore = stateBefore.missions.length;
    const tasksCountBefore = stateBefore.tasks.length;

    const cloned = repo.cloneTemplate('tpl-saas-launch');
    expect(cloned.title).toContain('Lançamento de Produto Digital');

    const stateAfter = repo.getState();
    expect(stateAfter.missions.length).toBe(missionsCountBefore + 1);
    expect(stateAfter.tasks.length).toBeGreaterThan(tasksCountBefore);

    const clonedSubmissions = repo.getSubmissionsByMission(cloned.id);
    expect(clonedSubmissions.length).toBeGreaterThan(0);
  });
});
