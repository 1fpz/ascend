'use client';

import React, { useState, useEffect } from 'react';
import { BarChart2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getRepository } from '@/lib/store';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [attributeData, setAttributeData] = useState<{ name: string; value: number }[]>([]);
  const [xpHistoryData, setXpHistoryData] = useState<{ name: string; xp: number }[]>([]);

  useEffect(() => {
    const repo = getRepository();
    const state = repo.getState();

    const tasks = state.tasks;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    setTaskStats({
      total: tasks.length,
      completed,
      pending: tasks.length - completed,
    });

    const char = state.character;
    setAttributeData([
      { name: 'Disciplina', value: char.discipline },
      { name: 'Conhecimento', value: char.knowledge },
      { name: 'Saúde', value: char.health },
      { name: 'Execução', value: char.execution },
      { name: 'Consistência', value: char.consistency },
    ]);

    // Aggregate XP from ledger
    const ledger = state.xpLedger;
    const lastEntries = ledger.slice(0, 7).reverse();
    setXpHistoryData(
      lastEntries.map((e, idx) => ({
        name: `Op ${idx + 1}`,
        xp: Math.max(0, e.xpAmount),
      }))
    );

    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-400 font-mono text-xs">Carregando Life Analytics...</div>
      </div>
    );
  }

  const completionRate =
    taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;

  const COLORS = ['#6366f1', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#1c2235] pb-5">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-indigo-400" />
          Life Analytics — Inteligência Pessoal Determinística
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Métricas calculadas exclusivamente a partir de registros persistidos no banco. Sem inferências sintéticas.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="border-[#20273c] bg-[#0d111d]">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs font-mono uppercase text-gray-400">Taxa de Conclusão</span>
            <div className="text-3xl font-black text-emerald-400">{completionRate}%</div>
            <p className="text-xs text-gray-500">
              {taskStats.completed} de {taskStats.total} tarefas finalizadas
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#20273c] bg-[#0d111d]">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs font-mono uppercase text-gray-400">Tarefas Pendentes</span>
            <div className="text-3xl font-black text-amber-400">{taskStats.pending}</div>
            <p className="text-xs text-gray-500">Ações em aberto na fila do planner</p>
          </CardContent>
        </Card>

        <Card className="border-[#20273c] bg-[#0d111d]">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs font-mono uppercase text-gray-400">Eventos de XP Auditados</span>
            <div className="text-3xl font-black text-indigo-400">{xpHistoryData.length}</div>
            <p className="text-xs text-gray-500">Operações no livro-razão com chave idempotente</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attribute Distribution Bar Chart */}
        <Card className="border-[#20273c] bg-[#0d111d]">
          <CardHeader>
            <CardTitle className="text-base">Distribuição dos 5 Atributos Centrais</CardTitle>
            <CardDescription>Pontuação acumulada por tipo de atividade</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attributeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141828', borderColor: '#242c44', color: '#fff' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {attributeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* XP Gains History Chart */}
        <Card className="border-[#20273c] bg-[#0d111d]">
          <CardHeader>
            <CardTitle className="text-base">Ganhos Recentes de XP (Auditoria)</CardTitle>
            <CardDescription>Fluxo de pontos registrados por conclusão</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={xpHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141828', borderColor: '#242c44', color: '#fff' }}
                />
                <Bar dataKey="xp" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
