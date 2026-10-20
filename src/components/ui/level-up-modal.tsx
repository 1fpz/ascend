'use client';

import React, { useEffect } from 'react';
import { Zap, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from './button';
import { soundFx } from '@/lib/audio';
import { triggerRewardConfetti } from '@/lib/confetti';

interface LevelUpModalProps {
  newLevel: number;
  onClose: () => void;
}

export function LevelUpModal({ newLevel, onClose }: LevelUpModalProps) {
  useEffect(() => {
    soundFx.playLevelUpFanfare();
    triggerRewardConfetti();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md p-8 rounded-2xl bg-gradient-to-b from-[#141829] to-[#0a0d17] border-2 border-indigo-500/50 shadow-2xl glow-indigo text-center space-y-6 animate-in zoom-in-95 duration-300">
        {/* Glow badge */}
        <div className="inline-flex p-4 rounded-full bg-indigo-600/20 border border-indigo-400 text-indigo-400 shadow-lg shadow-indigo-600/40">
          <Zap className="w-12 h-12 fill-indigo-400 animate-bounce" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block">
            ASCENSÃO DE NÍVEL ALCANÇADA
          </span>
          <h2 className="text-4xl font-black text-white tracking-tight">
            NÍVEL {newLevel}
          </h2>
          <p className="text-sm text-gray-300">
            Sua constância e disciplina renderam frutos reais. Seus atributos foram ampliados no
            livro-razão do sistema.
          </p>
        </div>

        {/* Attribute bonus visual */}
        <div className="p-4 rounded-xl bg-[#0e1220] border border-[#20273f] grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-300 font-semibold">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>+1 Disciplina</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-300 font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>+1 Execução</span>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full font-bold text-base shadow-xl shadow-indigo-600/30"
          onClick={onClose}
        >
          Continuar Ascendendo <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );
}
