'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getRepository } from '@/lib/store';
import { planDay, PlannedTask } from '@/lib/domain/planner';
import { triggerRewardConfetti } from '@/lib/confetti';
import { TaskItem } from '@/lib/types';

export default function DailyPlannerPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [timeBudgetMinutes, setTimeBudgetMinutes] = useState<number>(360); // 6 hours default
  const [allTasks, setAllTasks] = useState<TaskItem[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const reloadData = () => {
    const repo = getRepository();
    setAllTasks([...repo.getTasks()]);
  };

  useEffect(() => {
    setMounted(true);
    reloadData();
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-400 font-mono text-xs">Carregando Daily Planner...</div>
      </div>
    );
  }

  // Convert tasks to domain PlannedTask interface
  const plannedTasks: PlannedTask[] = allTasks
    .filter((t) => t.status !== 'archived')
    .map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      difficulty: t.difficulty,
      estimatedMinutes: t.estimatedMinutes,
      dueDate: t.dueDate,
      scheduledDate: t.scheduledDate,
      isBlocked: t.status === 'blocked',
      isCompleted: t.status === 'completed',
    }));

  const plan = planDay(plannedTasks, selectedDate, timeBudgetMinutes);

  const handleCompleteTask = (taskId: string) => {
    const repo = getRepository();
    const res = repo.completeTask(taskId);
    triggerRewardConfetti();
    setFeedbackMsg(`+${res.xpAwarded} XP concedidos com sucesso!`);
    setTimeout(() => setFeedbackMsg(null), 3000);
    reloadData();
  };

  const handleReopenTask = (taskId: string) => {
    const repo = getRepository();
    repo.reopenTask(taskId);
    setFeedbackMsg('Tarefa reaberta.');
    setTimeout(() => setFeedbackMsg(null), 3000);
    reloadData();
  };

  // Date navigation
  const shiftDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const budgetUsagePercent = Math.min(
    100,
    Math.round((plan.totalEstimatedMinutes / timeBudgetMinutes) * 100)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Feedback Alert */}
      {feedbackMsg && (
        <div className="bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 px-4 py-3 rounded-lg flex items-center justify-between text-sm shadow-lg">
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs text-emerald-400">
            Fechar
          </button>
        </div>
      )}

      {/* Header & Date Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1c2235] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-400" />
            Planner Diário & Carga de Trabalho
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Algoritmo determinístico de priorização por urgência, prazos e orçamento de tempo disponível.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-[#121626] border border-[#22293e] rounded-lg p-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => shiftDate(-1)}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-xs font-mono font-bold text-white focus:outline-none px-2"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => shiftDate(1)}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Time Budget Slider & Workload Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-[#101422] border-[#20273c]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Orçamento de Tempo Diário
              </CardTitle>
              <span className="text-xs font-mono font-bold text-indigo-400">
                {timeBudgetMinutes} minutos ({(timeBudgetMinutes / 60).toFixed(1)}h)
              </span>
            </div>
            <CardDescription>
              Defina quantas horas você tem disponíveis hoje. O motor reorganiza as prioridades.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="range"
              min={60}
              max={720}
              step={30}
              value={timeBudgetMinutes}
              onChange={(e) => setTimeBudgetMinutes(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-2 bg-[#1a2236] rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-gray-500 font-mono">
              <span>1h (Foco Rápido)</span>
              <span>6h (Dia Padrão)</span>
              <span>12h (Imersão Total)</span>
            </div>
          </CardContent>
        </Card>

        {/* Workload Indicator */}
        <Card className="bg-[#101422] border-[#20273c]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Carga de Trabalho</CardTitle>
            <CardDescription>Cálculo da demanda do dia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-black text-white">
                {plan.totalEstimatedMinutes} min
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {budgetUsagePercent}% da capacidade
              </span>
            </div>
            <Progress
              value={budgetUsagePercent}
              color={budgetUsagePercent > 100 ? 'bg-rose-500' : 'bg-emerald-500'}
            />
            <p className="text-[11px] text-gray-400 mt-2">
              {budgetUsagePercent > 100
                ? '⚠️ Carga diária excede o limite informado. Tarefas excedentes foram separadas abaixo.'
                : '✅ Toda a lista prioritária cabe no seu tempo planejado.'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Fitting Budget */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Tarefas Prioritárias Que Cabem no Horário ({plan.tasksFittingBudget.length})
          </h2>
          <span className="text-xs text-gray-400 font-mono">
            Ordem gerada por regras de prioridade e prazo
          </span>
        </div>

        {plan.tasksFittingBudget.length === 0 ? (
          <Card className="border-dashed border-[#232a3f]">
            <CardContent className="p-8 text-center text-sm text-gray-400">
              Nenhuma tarefa pendente com prioridade para este orçamento de tempo.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {plan.tasksFittingBudget.map((item, index) => (
              <Card
                key={item.task.id}
                className="border-[#21293e] bg-[#0e1220] hover:border-[#2d3855] transition-all"
              >
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-300 text-[11px] font-mono flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <Badge
                        variant={
                          item.task.priority === 'urgent'
                            ? 'danger'
                            : item.task.priority === 'high'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {item.task.priority}
                      </Badge>
                      <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.task.estimatedMinutes}m (Acumulado: {item.cumulativeMinutes}m)
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{item.task.title}</h4>

                    {/* Rule-based Explanation */}
                    <p className="text-[11px] text-indigo-300/80 bg-[#14192b] px-2.5 py-1 rounded w-fit font-mono">
                      Critério: {item.explanation}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/smart-task/${item.task.id}`}>
                      <Button size="sm" variant="secondary">
                        <Play className="w-3 h-3 text-indigo-400" /> Executar
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleCompleteTask(item.task.id)}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Concluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Tasks Exceeding Budget */}
      {plan.tasksExceedingBudget.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#1c2235]">
          <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Tarefas Excedentes ao Tempo Disponível ({plan.tasksExceedingBudget.length})
          </h2>
          <p className="text-xs text-gray-400">
            Estas tarefas não cabem no limite de {timeBudgetMinutes} minutos. Reagende para outro dia
            ou aumente o orçamento diário.
          </p>

          <div className="space-y-2">
            {plan.tasksExceedingBudget.map((item) => (
              <div
                key={item.task.id}
                className="p-3.5 rounded-lg border border-[#262118] bg-[#14110e] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="warning">{item.task.priority}</Badge>
                    <span className="text-xs font-semibold text-gray-200">{item.task.title}</span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-mono block mt-1">
                    {item.explanation}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-400">{item.task.estimatedMinutes}m</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCompleteTask(item.task.id)}
                  >
                    Concluir Mesmo Assim
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blocked Tasks */}
      {plan.blockedTasks.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#1c2235]">
          <h2 className="text-base font-bold text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Tarefas Bloqueadas por Dependências ({plan.blockedTasks.length})
          </h2>
          <div className="space-y-2">
            {plan.blockedTasks.map((item) => (
              <div
                key={item.task.id}
                className="p-3.5 rounded-lg border border-rose-900/30 bg-[#160d10] flex items-center justify-between text-xs"
              >
                <span className="text-rose-200 font-medium">{item.task.title}</span>
                <span className="text-rose-400 font-mono text-[11px]">{item.explanation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Section */}
      {plan.completedTasks.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[#1c2235]">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Tarefas Concluídas ({plan.completedTasks.length})
          </h3>
          <div className="space-y-2">
            {plan.completedTasks.map((item) => (
              <div
                key={item.task.id}
                className="p-3 rounded-lg border border-[#1b2234] bg-[#0c0f18]/60 flex items-center justify-between text-xs text-gray-400"
              >
                <div className="flex items-center gap-2 line-through text-gray-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{item.task.title}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleReopenTask(item.task.id)}
                  className="text-[11px] h-7 px-2"
                >
                  <RotateCcw className="w-3 h-3 mr-1" /> Reabrir
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
