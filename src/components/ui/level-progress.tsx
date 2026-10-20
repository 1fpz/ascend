import React from 'react';
import { getLevelProgressFromTotalXp } from '@/lib/domain/gamification';
import { Progress } from './progress';
import { Zap } from 'lucide-react';

export function LevelProgressBar({ totalXp }: { totalXp: number }) {
  const { level, currentLevelXp, xpForNextLevel, progressPercent } =
    getLevelProgressFromTotalXp(totalXp);

  return (
    <div className="flex flex-col space-y-1.5 w-full">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-indigo-400">
          <Zap className="w-3.5 h-3.5 fill-indigo-400" />
          <span>NÍVEL {level}</span>
        </div>
        <div className="text-gray-400 font-mono">
          <span className="text-white font-semibold">{currentLevelXp}</span> / {xpForNextLevel} XP ({progressPercent}%)
        </div>
      </div>
      <Progress value={progressPercent} color="bg-gradient-to-r from-indigo-500 to-violet-500" />
    </div>
  );
}
