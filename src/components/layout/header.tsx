'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Plus, Flame, Search, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../ui/button';
import { getRepository } from '@/lib/store';
import { getLevelProgressFromTotalXp } from '@/lib/domain/gamification';
import { soundFx } from '@/lib/audio';

interface HeaderStats {
  maxStreak: number;
  level: number;
  progressPercent: number;
  todayStr: string;
}

export function Header() {
  // Load store/date-derived values only after mount to avoid SSR/client
  // hydration mismatch (server sees DEFAULT_STATE, client sees localStorage).
  const [stats, setStats] = useState<HeaderStats | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
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

    setStats({ maxStreak, level, progressPercent, todayStr });
  }, []);

  const toggleSound = () => {
    const active = soundFx.toggleBrownNoise();
    setIsPlayingAudio(active);
  };

  const triggerSearch = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
  };

  return (
    <header className="h-16 border-b border-[#1a2238] bg-[#070910]/85 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Date & Quick Search Command Bar */}
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-wider text-gray-400 font-mono hidden lg:inline">
          {stats?.todayStr ?? ''}
        </span>
        <button
          onClick={triggerSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0e1322] hover:bg-[#151c30] border border-[#202942] text-xs text-gray-400 hover:text-gray-200 transition-all cursor-pointer shadow-inner"
        >
          <Search className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Comandos Rápidos</span>
          <kbd className="px-1.5 py-0.5 rounded bg-[#161c2e] border border-[#2b3756] text-[10px] font-mono text-gray-300">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Stats & Quick Actions */}
      <div className="flex items-center gap-2.5 md:gap-4">
        {/* Ambient Brown Noise Toggle */}
        <button
          onClick={toggleSound}
          title={isPlayingAudio ? 'Desativar ruído de foco' : 'Ativar ruído marrom de foco'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all cursor-pointer ${
            isPlayingAudio
              ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/40 animate-pulse'
              : 'bg-[#0f1424] text-gray-400 border-[#202840] hover:text-white'
          }`}
        >
          {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{isPlayingAudio ? 'Foco On' : 'Foco'}</span>
        </button>

        {/* Streak Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141210] border border-amber-900/40 text-xs font-semibold text-amber-400 shadow-sm">
          <Flame className="w-3.5 h-3.5 fill-amber-400" />
          <span>{stats ? `${stats.maxStreak}d` : '—'}</span>
        </div>

        {/* Level & XP Mini Badge */}
        <Link
          href="/character"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/70 border border-indigo-600/40 text-xs font-bold text-indigo-300 transition-all shadow-sm shadow-indigo-950 hover:shadow-indigo-600/20"
        >
          <Zap className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
          <span>NV {stats?.level ?? '—'}</span>
          <span className="text-[10px] text-indigo-400 font-mono">
            {stats ? `(${stats.progressPercent}%)` : ''}
          </span>
        </Link>

        {/* Quick New Mission / Task Button */}
        <Link href="/missions">
          <Button size="sm" className="hidden sm:inline-flex shadow-md shadow-indigo-600/30">
            <Plus className="w-3.5 h-3.5" />
            Nova Missão
          </Button>
        </Link>
      </div>
    </header>
  );
}
