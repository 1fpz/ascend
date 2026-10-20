'use client';

import React, { useState, useEffect } from 'react';
import {
  Repeat,
  Plus,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getRepository } from '@/lib/store';
import { triggerRewardConfetti } from '@/lib/confetti';
import { HabitItem, HabitLog } from '@/lib/types';

export default function HabitsPage() {
  const [mounted, setMounted] = useState(false);
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [showModal, setShowModal] = useState(false);

  // New Habit Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequencyType, setFrequencyType] = useState<'daily' | 'specific_days' | 'weekly_count'>('daily');

  const todayStr = new Date().toISOString().split('T')[0];

  const reloadData = () => {
    const repo = getRepository();
    const state = repo.getState();
    setHabits([...state.habits]);
    setHabitLogs([...state.habitLogs]);
  };

  useEffect(() => {
    setMounted(true);
    reloadData();
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-400 font-mono text-xs">Carregando Hábitos & Rotinas...</div>
      </div>
    );
  }

  const handleToggleHabit = (habitId: string, dateStr: string) => {
    const repo = getRepository();
    const { completed } = repo.toggleHabitLog(habitId, dateStr);
    if (completed) triggerRewardConfetti();
    reloadData();
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const repo = getRepository();
    const state = repo.getState();
    const newHabit: HabitItem = {
      id: `habit-${Date.now()}`,
      userId: 'user-default',
      title: title.trim(),
      description: description.trim(),
      frequencyType,
      frequencyDays: [1, 2, 3, 4, 5, 6, 7],
      targetCount: 1,
      currentStreak: 0,
      longestStreak: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    state.habits.push(newHabit);
    setTitle('');
    setDescription('');
    setShowModal(false);
    reloadData();
  };

  // Helper to get past 7 days dates
  const pastDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2235] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Repeat className="w-6 h-6 text-amber-400" />
            Hábitos & Rituais Diários
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Construa consistência dia a dia. Registros de ocorrência independentes sem penalidade excessiva.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-1" /> Novo Hábito
        </Button>
      </div>

      {/* Habit Cards Grid */}
      <div className="space-y-4">
        {habits.map((habit) => {
          const isDoneToday = habitLogs.some(
            (l) => l.habitId === habit.id && l.logDate === todayStr && l.completed
          );

          return (
            <Card
              key={habit.id}
              className={`border transition-all ${
                isDoneToday ? 'border-emerald-800/40 bg-[#0c131c]' : 'border-[#22293e] bg-[#0f1322]'
              }`}
            >
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{habit.title}</h3>
                    <Badge variant={habit.currentStreak > 0 ? 'warning' : 'outline'}>
                      <Flame className="w-3 h-3 fill-amber-400 text-amber-400 mr-1" />
                      {habit.currentStreak}d Streak
                    </Badge>
                  </div>
                  {habit.description && (
                    <p className="text-xs text-gray-400">{habit.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-400 pt-1 font-mono">
                    <span>Melhor Sequência: {habit.longestStreak} dias</span>
                    <span>Frequência: {habit.frequencyType === 'daily' ? 'Diária' : 'Semanal'}</span>
                  </div>
                </div>

                {/* 7 Days Mini Tracker */}
                <div className="flex items-center gap-1.5 bg-[#14192b] p-2 rounded-lg border border-[#212840]">
                  {pastDays.map((dStr) => {
                    const isCompleted = habitLogs.some(
                      (l) => l.habitId === habit.id && l.logDate === dStr && l.completed
                    );
                    const dayLabel = new Date(dStr + 'T12:00:00Z').toLocaleDateString('pt-BR', {
                      weekday: 'narrow',
                    });
                    const isToday = dStr === todayStr;

                    return (
                      <button
                        key={dStr}
                        onClick={() => handleToggleHabit(habit.id, dStr)}
                        title={`${dStr}: ${isCompleted ? 'Concluído' : 'Não concluído'}`}
                        className={`w-7 h-8 rounded flex flex-col items-center justify-center text-[10px] font-mono cursor-pointer transition-colors ${
                          isCompleted
                            ? 'bg-emerald-600 text-white font-bold'
                            : isToday
                            ? 'bg-[#1e253c] text-indigo-300 border border-indigo-500/50'
                            : 'bg-[#101424] text-gray-500 hover:bg-[#1a2034]'
                        }`}
                      >
                        <span className="text-[9px]">{dayLabel}</span>
                        {isCompleted && <span className="text-[10px] leading-none">✓</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Action Button */}
                <div className="shrink-0">
                  <Button
                    size="sm"
                    variant={isDoneToday ? 'secondary' : 'primary'}
                    onClick={() => handleToggleHabit(habit.id, todayStr)}
                  >
                    {isDoneToday ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1" /> Concluído Hoje
                      </>
                    ) : (
                      'Concluir Hoje (+20 XP)'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Habit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-[#0e121e] border-[#29324a]">
            <CardHeader>
              <CardTitle className="text-base">Cadastrar Novo Hábito Diário</CardTitle>
              <CardDescription>
                Rotinas consistentes acumulam atributos de Consistência e Disciplina.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateHabit}>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Título do Hábito *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Beber 3L de Água ou Leitura Bíblica"
                    className="w-full px-3 py-2 rounded-lg bg-[#151a2b] border border-[#232a3f] text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Descrição / Gatilho</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Em qual momento do dia este hábito será executado?"
                    className="w-full px-3 py-2 rounded-lg bg-[#151a2b] border border-[#232a3f] text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Frequência</label>
                  <select
                    value={frequencyType}
                    onChange={(e) => setFrequencyType(e.target.value as 'daily' | 'specific_days' | 'weekly_count')}
                    className="w-full px-3 py-2 rounded-lg bg-[#151a2b] border border-[#232a3f] text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="daily">Todos os dias (Diário)</option>
                    <option value="specific_days">Dias específicos da semana</option>
                    <option value="weekly_count">Meta semanal (Ex: 3x na semana)</option>
                  </select>
                </div>
              </CardContent>
              <div className="p-5 pt-0 flex justify-end gap-3">
                <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm">
                  Salvar Hábito
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
