import { describe, it, expect } from 'vitest';
import {
  calculateTaskXp,
  xpRequiredForLevel,
  getLevelProgressFromTotalXp,
  getAttributeForTaskType,
  generateIdempotencyKey,
} from '../gamification';

describe('Gamification & XP Ledger Engine', () => {
  it('calculates deterministic XP for different difficulties and priorities', () => {
    // easy: 25 * 1.0 + 3 = 28 XP (for 30 min)
    expect(calculateTaskXp('easy', 'low', 30)).toBe(28);
    // epic: 250 * 1.4 + 6 = 356 XP (for 60 min)
    expect(calculateTaskXp('epic', 'urgent', 60)).toBe(356);
  });

  it('calculates deterministic level progression curve', () => {
    expect(xpRequiredForLevel(1)).toBe(100);
    expect(xpRequiredForLevel(2)).toBe(303);
    expect(xpRequiredForLevel(3)).toBe(580);
  });

  it('determines level and progress accurately from total XP', () => {
    // 0 XP -> Level 1, 0%
    const l1 = getLevelProgressFromTotalXp(0);
    expect(l1.level).toBe(1);
    expect(l1.progressPercent).toBe(0);

    // 50 XP -> Level 1, 50%
    const l1_half = getLevelProgressFromTotalXp(50);
    expect(l1_half.level).toBe(1);
    expect(l1_half.progressPercent).toBe(50);

    // 100 XP -> Level 2, 0%
    const l2 = getLevelProgressFromTotalXp(100);
    expect(l2.level).toBe(2);
    expect(l2.currentLevelXp).toBe(0);
    expect(l2.progressPercent).toBe(0);

    // 250 XP -> Level 2, 150/303 = 50%
    const l2_prog = getLevelProgressFromTotalXp(250);
    expect(l2_prog.level).toBe(2);
    expect(l2_prog.currentLevelXp).toBe(150);
    expect(l2_prog.progressPercent).toBe(50);
  });

  it('maps smart task types to corresponding attributes', () => {
    expect(getAttributeForTaskType('study')).toBe('knowledge');
    expect(getAttributeForTaskType('workout')).toBe('health');
    expect(getAttributeForTaskType('habit')).toBe('consistency');
    expect(getAttributeForTaskType('timed')).toBe('discipline');
    expect(getAttributeForTaskType('simple')).toBe('execution');
  });

  it('generates consistent idempotency keys', () => {
    const key1 = generateIdempotencyKey('task', 'task-123', 'complete');
    const key2 = generateIdempotencyKey('task', 'task-123', 'complete');
    expect(key1).toBe('task:task-123:complete');
    expect(key1).toBe(key2);
  });
});
