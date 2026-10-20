'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Zap,
  Shield,
  BookOpen,
  Activity,
  CheckCircle2,
  Repeat,
  FileText,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LevelProgressBar } from '@/components/ui/level-progress';
import { getRepository } from '@/lib/store';
import { CharacterProfile, XpLedgerEntry } from '@/lib/types';
import { getLevelProgressFromTotalXp } from '@/lib/domain/gamification';

export default function CharacterPage() {
  const [mounted, setMounted] = useState(false);
  const [character, setCharacter] = useState<CharacterProfile | null>(null);
  const [ledger, setLedger] = useState<XpLedgerEntry[]>([]);

  useEffect(() => {
    const repo = getRepository();
    const state = repo.getState();
    setCharacter({ ...state.character });
    setLedger([...state.xpLedger]);
    setMounted(true);
  }, []);

  if (!mounted || !character) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-400 font-mono text-xs">Carregando Perfil RPG...</div>
      </div>
    );
  }

  const { level } = getLevelProgressFromTotalXp(character.totalXp);

  const attributes = [
    { name: 'Disciplina', value: character.discipline, icon: Shield, color: 'text-indigo-400', desc: 'Capacidade de seguir planos e honrar prazos.' },
    { name: 'Conhecimento', value: character.knowledge, icon: BookOpen, color: 'text-purple-400', desc: 'Leitura bíblica, técnica e retenção de estudo.' },
    { name: 'Saúde', value: character.health, icon: Activity, color: 'text-rose-400', desc: 'Atividade física, sono e hidratação.' },
    { name: 'Execução', value: character.execution, icon: CheckCircle2, color: 'text-emerald-400', desc: 'Tarefas concluídas com padrão de excelência.' },
    { name: 'Consistência', value: character.consistency, icon: Repeat, color: 'text-amber-400', desc: 'Frequência ininterrupta em rituais e hábitos.' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#1c2235] pb-5">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-400" />
          Perfil do Conquistador & Livro-Razão de XP
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Progressão orientada a regras transparentes. Cada ponto de atributo reflete ações reais registradas.
        </p>
      </div>

      {/* Level Summary Banner */}
      <Card className="border-indigo-900/30 bg-gradient-to-r from-[#111626] to-[#0c101c]">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Badge variant="purple">Nível de Ascensão</Badge>
            <div className="text-3xl font-black text-white flex items-center gap-2">
              <Zap className="w-6 h-6 fill-indigo-400 text-indigo-400" />
              NÍVEL {level}
            </div>
            <p className="text-xs text-gray-400">
              Total Acumulado na Jornada: <span className="font-mono font-bold text-white">{character.totalXp} XP</span>
            </p>
          </div>

          <div className="w-full md:w-96">
            <LevelProgressBar totalXp={character.totalXp} />
          </div>
        </CardContent>
      </Card>

      {/* 5 RPG Attributes Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Atributos do Personagem</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {attributes.map((attr) => {
            const Icon = attr.icon;
            return (
              <Card key={attr.name} className="border-[#20273c] bg-[#0d111d] hover:border-[#2f3956] transition-all">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <Icon className={`w-5 h-5 ${attr.color}`} />
                    <span className="text-2xl font-black font-mono text-white">{attr.value}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-200">{attr.name}</h3>
                    <p className="text-[11px] text-gray-400 mt-1">{attr.desc}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* XP Ledger Audit Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Livro-Razão de Auditoria de XP (Idempotente)
          </h2>
          <span className="text-xs text-gray-400 font-mono">
            {ledger.length} registros auditados
          </span>
        </div>

        <div className="border border-[#1e2538] rounded-xl overflow-hidden bg-[#0c101c]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121626] border-b border-[#1c2235] text-gray-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-3">Data</th>
                  <th className="p-3">Origem</th>
                  <th className="p-3">Motivo / Ação</th>
                  <th className="p-3">Atributo</th>
                  <th className="p-3">XP</th>
                  <th className="p-3 font-mono">Chave de Idempotência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#171d2e] text-gray-300">
                {ledger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[#0f1322] transition-colors">
                    <td className="p-3 font-mono text-gray-500 whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3 font-semibold text-gray-200">{entry.sourceType}</td>
                    <td className="p-3">{entry.reason}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-[#182033] text-indigo-300 font-mono uppercase text-[10px]">
                        {entry.attribute}
                      </span>
                    </td>
                    <td className="p-3 font-bold font-mono">
                      <span className={entry.xpAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {entry.xpAmount >= 0 ? `+${entry.xpAmount}` : entry.xpAmount}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[10px] text-gray-500 truncate max-w-xs">
                      {entry.idempotencyKey}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
