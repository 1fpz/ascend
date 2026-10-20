import confetti from 'canvas-confetti';

export function triggerRewardConfetti() {
  if (typeof window === 'undefined') return;

  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.8 },
    colors: ['#6366f1', '#10b981', '#f59e0b', '#3b82f6'],
    disableForReducedMotion: true,
  });
}
