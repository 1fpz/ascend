'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Target,
  Calendar,
  Repeat,
  CheckCircle2,
  Clock,
  ArrowRight,
  Flame,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LevelProgressBar } from '@/components/ui/level-progress';
import { ConsistencyHeatmap } from '@/components/ui/consistency-heatmap';
import { LevelUpModal } from '@/components/ui/level-up-modal';
import { getRepository } from '@/lib/store';
import { triggerRewardConfetti } from '@/lib/confetti';
import { soundFx } from '@/lib/audio';
import { TaskItem, Mission, HabitItem } from '@/lib/types';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [totalXp, setTotalXp] = useState(50);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [levelUpState, setLevelUpState] = useState<{ show: boolean; level: number }>({
    show: false,
    level: 1,
  });

  const reloadData = () => {
    const repo = getRepository();
    const state = repo.getState();
    setTasks([...state.tasks]);
    setMissions([...state.missions]);
    setHabits([...state.habits]);
    setTotalXp(state.character.totalXp);
  };

  useEffect(() => {
    setMounted(true);
    reloadData();
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-400 font-mono text-xs">Carregando Command Center...</div>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Daily actionable tasks
  const dailyTasks = tasks.filter((t) => t.status !== 'archived');
  const pendingTasks = dailyTasks.filter((t) => t.status !== 'completed');
  const completedTasks = dailyTasks.filter((t) => t.status === 'completed');
  const dailyProgress =
    dailyTasks.length > 0 ? Math.round((completedTasks.length / dailyTasks.length) * 100) : 0;

  // Active missions
  const activeMissions = missions.filter((m) => m.status === 'in_progress');
  const featuredMission = activeMissions[0] || missions[0];

  // Consistency dates map
  const repo = getRepository();
  const habitLogs = repo.getState().habitLogs;
  const activityMap: Record<string, number> = {};
  habitLogs.forEach((l) => {
    activityMap[l.logDate] = (activityMap[l.logDate] || 0) + 1;
  });
  tasks.forEach((t) => {
    if (t.completedAt) {
      const d = t.completedAt.split('T')[0];
      activityMap[d] = (activityMap[d] || 0) + 1;
    }
  });

  // Complete a task
  const handleCompleteTask = (taskId: string) => {
    try {
      const res = repo.completeTask(taskId);
      soundFx.playRewardSound();
      triggerRewardConfetti();

      if (res.leveledUp) {
        setLevelUpState({ show: true, level: repo.getState().character.level });
      } else {
        setFeedbackMsg(`+${res.xpAwarded} XP concedidos com sucesso!`);
        setTimeout(() => setFeedbackMsg(null), 3000);
      }

      reloadData();
    } catch (err: unknown) {
      console.error(err);
    }
  };

  // Reopen a task
  const handleReopenTask = (taskId: string) => {
    try {
      repo.reopenTask(taskId);
      setFeedbackMsg('Tarefa reaberta e XP ajustado.');
      setTimeout(() => setFeedbackMsg(null), 3000);
      reloadData();
    } catch (err: unknown) {
      console.error(err);
    }
  };

  // Toggle habit
  const handleToggleHabit = (habitId: string) => {
    try {
      const { completed } = repo.toggleHabitLog(habitId, todayStr);
      if (completed) {
        soundFx.playRewardSound();
        triggerRewardConfetti();
      }
      reloadData();
    } catch (err: unknown) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Level Up Celebration Modal */}
      {levelUpState.show && (
        <LevelUpModal
          newLevel={levelUpState.level}
          onClose={() => setLevelUpState({ show: false, level: 1 })}
        />
      )}

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className="bg-emerald-950 border border-emerald-500/60 text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-xl glow-emerald animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{feedbackMsg}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-xs text-emerald-400 hover:text-emerald-200 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Hero / Greeting Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-[#1b233a] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
              OPERACIONAL ATIVO
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-1">
            Command Center
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            Painel unificado de planejamento, hábitos e evolução pessoal gamificada.
          </p>
        </div>
        <div className="w-full md:w-88 p-4 rounded-2xl bg-[#0b0e18] border border-[#1e263d] shadow-lg">
          <LevelProgressBar totalXp={totalXp} />
        </div>
      </div>

      {/* Featured Mission & Daily Progress Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured Mission Card */}
        <Card className="lg:col-span-2 border-indigo-500/30 bg-gradient-to-br from-[#101526] via-[#0d111d] to-[#070910] shadow-xl">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="space-y-1.5">
              <Badge variant="purple" className="shadow-sm">Missão Primária em Foco</Badge>
              <CardTitle className="text-xl md:text-2xl font-black text-white mt-2">
                {featuredMission ? featuredMission.title : 'Nenhuma missão ativa'}
              </CardTitle>
              <CardDescription className="text-xs text-gray-300">
                {featuredMission
                  ? featuredMission.description
                  : 'Crie uma missão primária ou clone uma trilha da biblioteca para começar.'}
              </CardDescription>
            </div>
            {featuredMission && (
              <Badge variant={featuredMission.priority === 'urgent' ? 'danger' : 'warning'}>
                {featuredMission.priority}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {featuredMission && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-gray-300">
                  <span>Progresso Ponderado da Missão</span>
                  <span className="text-indigo-400 font-mono font-bold text-sm">
                    {featuredMission.calculatedProgress}%
                  </span>
                </div>
                <Progress
                  value={featuredMission.calculatedProgress}
                  color="bg-gradient-to-r from-indigo-500 to-purple-500"
                />
              </div>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-[#182136]">
              <span className="text-xs text-gray-400 font-mono">
                {featuredMission?.dueDate
                  ? `Vencimento: ${featuredMission.dueDate}`
                  : 'Sem prazo fixado'}
              </span>
              {featuredMission ? (
                <Link href={`/missions/${featuredMission.id}`}>
                  <Button size="sm" variant="secondary" className="border-indigo-500/40 hover:border-indigo-400">
                    Gerenciar Etapas <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              ) : (
                <Link href="/library">
                  <Button size="sm">Explorar Biblioteca de Trilhas</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Daily Execution Snapshot */}
        <Card className="border-[#1e273e] bg-[#0b0e18] shadow-xl flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between text-white font-bold">
              <span>Execução de Hoje</span>
              <Calendar className="w-4 h-4 text-indigo-400" />
            </CardTitle>
            <CardDescription>Progresso das tarefas programadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div className="text-4xl font-black text-white">{dailyProgress}%</div>
              <div className="text-xs text-gray-400 font-mono">
                <span className="text-emerald-400 font-bold">{completedTasks.length}</span> /{' '}
                {dailyTasks.length} concluídas
              </div>
            </div>
            <Progress
              value={dailyProgress}
              color={dailyProgress === 100 ? 'bg-emerald-400' : 'bg-indigo-500'}
            />

            <div className="pt-2">
              <Link href="/planner">
                <Button variant="outline" size="sm" className="w-full border-[#242e47] hover:bg-[#141b2e]">
                  Abrir Planner Diário
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 90-Day Consistency Heatmap Grid */}
      <Card className="border-[#1b233a] bg-[#0a0d16] p-5 shadow-lg">
        <ConsistencyHeatmap completedDates={activityMap} />
      </Card>

      {/* Main Grid: Actionable Tasks & Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Actionable Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" />
              Ações Prioritárias do Dia
            </h2>
            <Link href="/planner">
              <span className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer">
                Ver todas ({dailyTasks.length}) &rarr;
              </span>
            </Link>
          </div>

          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <Card className="border-dashed border-[#242c44] bg-[#090c15]">
                <CardContent className="p-8 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-base font-bold text-white">Todas as tarefas de hoje foram concluídas!</p>
                  <p className="text-xs text-gray-400">
                    Excelente execução. Planeje novas tarefas ou desfrute do tempo ganho.
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingTasks.slice(0, 5).map((task) => (
                <Card
                  key={task.id}
                  className="hover:border-indigo-500/50 transition-all bg-[#0d101c] border-[#1c2438] hover:shadow-lg hover:shadow-indigo-950/40"
                >
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            task.priority === 'urgent'
                              ? 'danger'
                              : task.priority === 'high'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {task.priority}
                        </Badge>
                        <span className="text-[11px] text-gray-400 uppercase font-mono">
                          {task.taskType.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-gray-500" />
                          {task.estimatedMinutes}m
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-100">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-gray-400 line-clamp-1">{task.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/smart-task/${task.id}`}>
                        <Button size="sm" variant="secondary" className="border-[#232d47]">
                          <Play className="w-3 h-3 text-indigo-400" /> Executar
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleCompleteTask(task.id)}
                        className="shadow-sm shadow-indigo-600/30"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Concluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Completed Today Section */}
          {completedTasks.length > 0 && (
            <div className="pt-4 space-y-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Concluídas Recentemente ({completedTasks.length})
              </h3>
              {completedTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl border border-[#161d2e] bg-[#090c15] flex items-center justify-between text-xs text-gray-400"
                >
                  <div className="flex items-center gap-2 line-through text-gray-500">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{task.title}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleReopenTask(task.id)}
                    className="text-[11px] h-7 px-2.5 text-gray-400 hover:text-white"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" /> Reabrir
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily Rituals / Habits Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Repeat className="w-5 h-5 text-amber-400" />
              Hábitos do Dia
            </h2>
            <Link href="/habits">
              <span className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer">
                Gerenciar &rarr;
              </span>
            </Link>
          </div>

          <div className="space-y-3">
            {habits.map((habit) => {
              const logs = repo.getHabitLogs(todayStr);
              const isDone = logs.some((l) => l.habitId === habit.id && l.completed);

              return (
                <Card
                  key={habit.id}
                  className={`border transition-all ${
                    isDone
                      ? 'border-emerald-600/50 bg-[#091512] shadow-sm shadow-emerald-950'
                      : 'border-[#1e273e] bg-[#0d101c] hover:border-[#2b3756]'
                  }`}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{habit.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Flame className="w-3.5 h-3.5 fill-amber-400" />
                          {habit.currentStreak} dias seguidos
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isDone ? 'secondary' : 'outline'}
                      onClick={() => handleToggleHabit(habit.id)}
                      className={isDone ? 'border-emerald-600/40 text-emerald-300' : 'border-[#242e47]'}
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1" /> Feito
                        </>
                      ) : (
                        'Marcar'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
