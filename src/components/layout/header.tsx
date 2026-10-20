'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, Plus, Flame } from 'lucide-react';
import { Button } from '../ui/button';
import { getRepository } from '@/lib/store';
import { getLevelProgressFromTotalXp } from '@/lib/domain/gamification';

export function Header() {
  const repo = getRepository();
  const character = repo.getState().character;
  const habits = repo.getHabits();
  const maxStreak = Math.max(0, ...habits.map((h) => h.currentStreak));
  const { level, progressPercent } = getLevelProgressFromTotalXp(character.totalXp);

  const todayStr = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(new Date());

  return (
    <header className="h-16 border-b border-[#1c2235] bg-[#0c0f18]/80 backdrop-blur-md px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Date & Title */}
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-wider text-gray-400 font-mono hidden sm:inline">
          {todayStr}
        </span>
      </div>

      {/* Stats & Quick Actions */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Streak Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141926] border border-[#232a3f] text-xs font-semibold text-amber-400">
          <Flame className="w-3.5 h-3.5 fill-amber-400" />
          <span>{maxStreak}d Streak</span>
        </div>

        {/* Level & XP Mini Badge */}
        <Link
          href="/character"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-700/40 text-xs font-semibold text-indigo-300 transition-colors"
        >
          <Zap className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
          <span>NV {level}</span>
          <span className="text-[10px] text-indigo-400 font-mono">({progressPercent}%)</span>
        </Link>

        {/* Quick New Mission / Task Button */}
        <Link href="/missions">
          <Button size="sm" className="hidden sm:inline-flex">
            <Plus className="w-3.5 h-3.5" />
            Nova Missão
          </Button>
        </Link>
      </div>
    </header>
  );
}
