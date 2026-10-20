'use client';

import React, { useState, useEffect } from 'react';
import { Award, Lock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getRepository } from '@/lib/store';
import { Achievement } from '@/lib/types';

export default function AchievementsPage() {
  const [mounted, setMounted] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const repo = getRepository();
    setAchievements([...repo.getState().achievements]);
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-400 font-mono text-xs">Carregando Conquistas...</div>
      </div>
    );
  }

  const unlockedCount = achievements.filter((a) => a.unlockedAt).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2235] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            Conquistas de Ascensão
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Desbloqueadas automaticamente conforme regras de execução e consistência comprovadas no banco.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-lg bg-[#141928] border border-[#232a3f] text-xs font-mono font-bold text-amber-400">
          {unlockedCount} de {achievements.length} Desbloqueadas
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {achievements.map((ach) => {
          const isUnlocked = !!ach.unlockedAt;

          return (
            <Card
              key={ach.id}
              className={`border transition-all ${
                isUnlocked
                  ? 'border-amber-700/40 bg-gradient-to-br from-[#121422] to-[#0d0f1a]'
                  : 'border-[#1e2436] bg-[#0a0d16] opacity-70'
              }`}
            >
              <CardContent className="p-5 flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl border shrink-0 ${
                    isUnlocked
                      ? 'bg-amber-950/60 border-amber-700/50 text-amber-400'
                      : 'bg-[#121626] border-[#1d2335] text-gray-600'
                  }`}
                >
                  {isUnlocked ? <Award className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{ach.title}</h3>
                    <Badge variant={isUnlocked ? 'warning' : 'outline'} className="text-[10px]">
                      +{ach.xpReward} XP
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400">{ach.description}</p>

                  <div className="pt-2 text-[11px] font-mono">
                    {isUnlocked ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Desbloqueada em {new Date(ach.unlockedAt!).toLocaleDateString('pt-BR')}
                      </span>
                    ) : (
                      <span className="text-gray-500">Bloqueada — Condição não atingida</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
