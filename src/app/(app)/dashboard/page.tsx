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
  Zap,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LevelProgressBar } from '@/components/ui/level-progress';
import { getRepository } from '@/lib/store';
import { triggerRewardConfetti } from '@/lib/confetti';
import { TaskItem, Mission, HabitItem } from '@/lib/types';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [totalXp, setTotalXp] = useState(50);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

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

  // Complete a task
  const handleCompleteTask = (taskId: string) => {
    try {
      const repo = getRepository();
      const res = repo.completeTask(taskId);
      triggerRewardConfetti();
      setFeedbackMsg(`+${res.xpAwarded} XP concedidos! Tarefa concluída.`);
      setTimeout(() => setFeedbackMsg(null), 3000);
      reloadData();
    } catch (err: unknown) {
      console.error(err);
    }
  };

  // Reopen a task
  const handleReopenTask = (taskId: string) => {
    try {
      const repo = getRepository();
      repo.reopenTask(taskId);
      setFeedbackMsg('Tarefa reaberta e XP recalculado.');
      setTimeout(() => setFeedbackMsg(null), 3000);
      reloadData();
    } catch (err: unknown) {
      console.error(err);
    }
  };

  // Toggle habit
  const handleToggleHabit = (habitId: string) => {
    try {
      const repo = getRepository();
      const { completed } = repo.toggleHabitLog(habitId, todayStr);
      if (completed) triggerRewardConfetti();
      reloadData();
    } catch (err: unknown) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className="bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 px-4 py-3 rounded-lg flex items-center justify-between text-sm shadow-lg">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1c2235] pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Command Center
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            Planejamento e execução de alta performance. Sem distrações.
          </p>
        </div>
        <div className="w-full md:w-80">
          <LevelProgressBar totalXp={totalXp} />
        </div>
      </div>

      {/* Featured Mission & Daily Progress Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured Mission Card */}
        <Card className="lg:col-span-2 border-indigo-900/30 bg-gradient-to-br from-[#121626] to-[#0d101c]">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="space-y-1">
              <Badge variant="purple">Missão em Destaque</Badge>
              <CardTitle className="text-xl font-bold mt-2">
                {featuredMission ? featuredMission.title : 'Nenhuma missão ativa'}
              </CardTitle>
              <CardDescription>
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
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-gray-400">
                  <span>Progresso Geral da Missão</span>
                  <span className="text-indigo-400">{featuredMission.calculatedProgress}%</span>
                </div>
                <Progress value={featuredMission.calculatedProgress} color="bg-indigo-500" />
              </div>
            )}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-gray-400">
                {featuredMission?.dueDate
                  ? `Prazo: ${featuredMission.dueDate}`
                  : 'Sem prazo fixado'}
              </span>
              {featuredMission ? (
                <Link href={`/missions/${featuredMission.id}`}>
                  <Button size="sm" variant="secondary">
                    Abrir Detalhes <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              ) : (
                <Link href="/library">
                  <Button size="sm">Explorar Trilhas</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Daily Execution Snapshot */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Execução de Hoje</span>
              <Calendar className="w-4 h-4 text-indigo-400" />
            </CardTitle>
            <CardDescription>Progresso das tarefas programadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-black text-white">{dailyProgress}%</div>
              <div className="text-xs text-gray-400 font-mono">
                <span className="text-emerald-400 font-bold">{completedTasks.length}</span> /{' '}
                {dailyTasks.length} concluídas
              </div>
            </div>
            <Progress value={dailyProgress} color="bg-emerald-500" />

            <div className="pt-2">
              <Link href="/planner">
                <Button variant="outline" size="sm" className="w-full">
                  Abrir Planner Diário
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Actionable Tasks & Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Actionable Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" />
              Ações Prioritárias do Dia
            </h2>
            <Link href="/planner">
              <span className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer">
                Ver todas ({dailyTasks.length})
              </span>
            </Link>
          </div>

          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <Card className="border-dashed border-[#242b40]">
                <CardContent className="p-8 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-sm font-semibold text-white">Todas as tarefas foram concluídas!</p>
                  <p className="text-xs text-gray-400">
                    Excelente trabalho de foco. Adicione novas ações no planner ou descanse.
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingTasks.slice(0, 5).map((task) => (
                <Card
                  key={task.id}
                  className="hover:border-[#2d3855] transition-all bg-[#0f1320]"
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
                        <span className="text-xs text-gray-400 uppercase font-mono">
                          {task.taskType.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {task.estimatedMinutes}m
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-100">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-gray-400 line-clamp-1">{task.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/smart-task/${task.id}`}>
                        <Button size="sm" variant="secondary">
                          <Play className="w-3 h-3 text-indigo-400" /> Executar
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleCompleteTask(task.id)}
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
                  className="p-3 rounded-lg border border-[#1b2234] bg-[#0c0f18]/60 flex items-center justify-between text-xs text-gray-400"
                >
                  <div className="flex items-center gap-2 line-through text-gray-500">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{task.title}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleReopenTask(task.id)}
                    className="text-[11px] h-7 px-2"
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
              <Repeat className="w-4 h-4 text-amber-400" />
              Hábitos do Dia
            </h2>
            <Link href="/habits">
              <span className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer">
                Gerenciar
              </span>
            </Link>
          </div>

          <div className="space-y-3">
            {habits.map((habit) => {
              const repo = getRepository();
              const logs = repo.getHabitLogs(todayStr);
              const isDone = logs.some((l) => l.habitId === habit.id && l.completed);

              return (
                <Card
                  key={habit.id}
                  className={`border transition-all ${
                    isDone
                      ? 'border-emerald-800/40 bg-[#0d161a]'
                      : 'border-[#22293e] bg-[#0f1320]'
                  }`}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-100">{habit.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1 font-mono text-amber-400">
                          <Flame className="w-3 h-3 fill-amber-400" />
                          {habit.currentStreak} dias seguidos
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isDone ? 'secondary' : 'outline'}
                      onClick={() => handleToggleHabit(habit.id)}
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1" /> Concluído
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
