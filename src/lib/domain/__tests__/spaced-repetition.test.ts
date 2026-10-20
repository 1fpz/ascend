import { describe, it, expect } from 'vitest';
import { calculateNextReview } from '../spaced-repetition';

describe('Spaced Repetition SM-2 Engine', () => {
  it('resets repetitions and sets interval to 1 on failed recall (Grade 1)', () => {
    const card = {
      repetitions: 3,
      intervalDays: 14,
      easeFactor: 2.5,
    };
    const res = calculateNextReview(card, 1, '2026-10-20');
    expect(res.repetitions).toBe(0);
    expect(res.intervalDays).toBe(1);
    expect(res.nextReviewDate).toBe('2026-10-21');
  });

  it('increments intervals properly on successful ratings (Grade 3 - Bom)', () => {
    // First review
    const r1 = calculateNextReview({ repetitions: 0, intervalDays: 1, easeFactor: 2.5 }, 3, '2026-10-20');
    expect(r1.repetitions).toBe(1);
    expect(r1.intervalDays).toBe(1);

    // Second review
    const r2 = calculateNextReview({ repetitions: 1, intervalDays: 1, easeFactor: 2.5 }, 3, '2026-10-21');
    expect(r2.repetitions).toBe(2);
    expect(r2.intervalDays).toBe(6);

    // Third review
    const r3 = calculateNextReview({ repetitions: 2, intervalDays: 6, easeFactor: 2.5 }, 3, '2026-10-27');
    expect(r3.repetitions).toBe(3);
    expect(r3.intervalDays).toBe(15); // 6 * 2.5 = 15
  });
});
