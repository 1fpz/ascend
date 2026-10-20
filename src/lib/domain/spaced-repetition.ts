// ==============================================================================
// PROJECT ASCEND — SPACED REPETITION ENGINE (SM-2 DETERMINISTIC ALGORITHM)
// Pure Mathematical Flashcard Memory Retain System — Zero AI
// ==============================================================================

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  category: string;
  repetitions: number;
  intervalDays: number;
  easeFactor: number; // starts at 2.5
  nextReviewDate: string; // YYYY-MM-DD
}

export type ReviewGrade = 1 | 2 | 3 | 4; // 1: Errei/Again, 2: Difícil/Hard, 3: Bom/Good, 4: Fácil/Easy

/**
 * Calculates the next review schedule using the deterministic SM-2 algorithm.
 */
export function calculateNextReview(
  card: Pick<FlashcardItem, 'repetitions' | 'intervalDays' | 'easeFactor'>,
  grade: ReviewGrade,
  currentDateStr: string
): { repetitions: number; intervalDays: number; easeFactor: number; nextReviewDate: string } {
  // Map 1-4 scale to SM-2 0-5 scale
  // 1 -> 1, 2 -> 3, 3 -> 4, 4 -> 5
  const gradeMap: Record<ReviewGrade, number> = {
    1: 1,
    2: 3,
    3: 4,
    4: 5,
  };
  const q = gradeMap[grade];

  // Update Ease Factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  let newEf = card.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (newEf < 1.3) newEf = 1.3;

  let newRepetitions = card.repetitions;
  let newInterval = 1;

  if (q < 3) {
    // Failed recall
    newRepetitions = 0;
    newInterval = 1;
  } else {
    // Successful recall
    if (newRepetitions === 0) {
      newInterval = 1;
    } else if (newRepetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(card.intervalDays * newEf);
    }
    newRepetitions += 1;
  }

  const nextDate = new Date(currentDateStr + 'T12:00:00Z');
  nextDate.setDate(nextDate.getDate() + newInterval);

  return {
    repetitions: newRepetitions,
    intervalDays: newInterval,
    easeFactor: Number(newEf.toFixed(2)),
    nextReviewDate: nextDate.toISOString().split('T')[0],
  };
}
