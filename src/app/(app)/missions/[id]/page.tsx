'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  Clock,
  Layers,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getRepository } from '@/lib/store';
import { triggerRewardConfetti } from '@/lib/confetti';
import { Mission, Submission, TaskItem, TaskPriority, TaskDifficulty, TaskType } from '@/lib/types';

export default function MissionDetailPage() {
  const params = useParams();
  const missionId = params?.id as string;

  const [mounted, setMounted] = useState(false);
  const [mission, setMission] = useState<Mission | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [showSubModal, setShowSubModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [targetSubId, setTargetSubId] = useState<string>('');

  // New Submission Form
  const [subTitle, setSubTitle] = useState('');
  const [subDescription, setSubDescription] = useState('');

  // New Task Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('simple');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskDifficulty, setTaskDifficulty] = useState<TaskDifficulty>('medium');
  const [taskMinutes, setTaskMinutes] = useState(30);

  const reloadData = useCallback(() => {
    if (!missionId) return;
    const repo = getRepository();
    const m = repo.getMissionById(missionId);
    if (!m) return;
    setMission({ ...m });
    setSubmissions([...repo.getSubmissionsByMission(missionId)]);
    setTasks([...repo.getTasks().filter((t) => t.missionId === missionId)]);
  }, [missionId]);

  useEffect(() => {
    setMounted(true);
    reloadData();
  }, [reloadData]);

  if (!mounted || !mission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="text-gray-400 font-mono text-xs">Carregando detalhes da missão...</div>
        <Link href="/missions">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para Missões
          </Button>
        </Link>
      </div>
    );
  }

  const handleCreateSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subTitle.trim()) return;

    const repo = getRepository();
    repo.createSubmission({
      userId: 'user-default',
      missionId,
      title: subTitle.trim(),
      description: subDescription.trim(),
      sortOrder: submissions.length + 1,
      status: 'pending',
    });

    setSubTitle('');
    setSubDescription('');
    setShowSubModal(false);
    reloadData();
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const repo = getRepository();
    repo.createTask({
      userId: 'user-default',
      missionId,
      submissionId: targetSubId || null,
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      taskType,
      priority: taskPriority,
      difficulty: taskDifficulty,
      estimatedMinutes: Number(taskMinutes) || 30,
      isSideTask: false,
      scheduledDate: new Date().toISOString().split('T')[0],
      config: taskType === 'bible_reading' ? { passageKey: 'proverbios-3' } : {},
      resultData: {},
    });

    setTaskTitle('');
    setTaskDescription('');
    setShowTaskModal(false);
    reloadData();
  };

  const handleCompleteTask = (taskId: string) => {
    const repo = getRepository();
    repo.completeTask(taskId);
    triggerRewardConfetti();
    reloadData();
  };

  const handleReopenTask = (taskId: string) => {
    const repo = getRepository();
    repo.reopenTask(taskId);
    reloadData();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2235] pb-5">
        <div className="flex items-center gap-3">
          <Link href="/missions">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant={mission.status === 'completed' ? 'success' : 'default'}>
                {mission.status}
              </Badge>
              <span className="text-xs text-gray-400 font-mono">Dificuldade: {mission.difficulty}</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">{mission.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowSubModal(true)}
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Etapa / Submissão
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setTargetSubId('');
              setShowTaskModal(true);
            }}
          >
            <Plus className="w-3.5 h-3.5" /> Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Objetivo e Propósito</CardTitle>
            <CardDescription>{mission.description || 'Sem descrição cadastrada.'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mission.purpose && (
              <div className="p-3.5 rounded-lg bg-[#141824] border border-[#232a3d] text-xs text-gray-300">
                <span className="font-bold text-indigo-400 block mb-1">PROPÓSITO CENTRAL:</span>
                {mission.purpose}
              </div>
            )}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-400 font-semibold">
                <span>Progresso Ponderado da Missão</span>
                <span className="text-indigo-400">{mission.calculatedProgress}%</span>
              </div>
              <Progress
                value={mission.calculatedProgress}
                color={mission.calculatedProgress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Métricas da Missão</CardTitle>
            <CardDescription>Resumo estrutural</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-gray-300">
            <div className="flex justify-between py-1.5 border-b border-[#1c2235]">
              <span className="text-gray-400">Etapas (Submissões):</span>
              <span className="font-mono font-bold text-white">{submissions.length}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1c2235]">
              <span className="text-gray-400">Total de Tarefas:</span>
              <span className="font-mono font-bold text-white">{tasks.length}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1c2235]">
              <span className="text-gray-400">Tarefas Concluídas:</span>
              <span className="font-mono font-bold text-emerald-400">
                {tasks.filter((t) => t.status === 'completed').length}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400">Prazo:</span>
              <span className="font-mono text-white">{mission.dueDate || 'Não especificado'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions & Structured Tasks */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          Etapas e Ações Concretas
        </h2>

        {submissions.length === 0 ? (
          <Card className="border-dashed border-[#232a3f]">
            <CardContent className="p-8 text-center space-y-3">
              <p className="text-sm text-gray-300 font-semibold">
                Esta missão ainda não possui etapas divididas.
              </p>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Divida grandes objetivos em submissões intermediárias para calcular o progresso
                claramente e evitar paralisia de execução.
              </p>
              <Button size="sm" onClick={() => setShowSubModal(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Criar Primeira Etapa
              </Button>
            </CardContent>
          </Card>
        ) : (
          submissions.map((sub) => {
            const subTasks = tasks.filter((t) => t.submissionId === sub.id);

            return (
              <Card key={sub.id} className="border-[#202638] bg-[#0d111d]">
                <CardHeader className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#192033]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#182033] text-gray-300">
                        Fase {sub.sortOrder}
                      </span>
                      <CardTitle className="text-base font-bold text-white">{sub.title}</CardTitle>
                    </div>
                    {sub.description && (
                      <CardDescription className="text-xs">{sub.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <div className="flex justify-between text-[11px] text-gray-400 font-mono mb-1">
                        <span>Progresso</span>
                        <span>{sub.calculatedProgress}%</span>
                      </div>
                      <Progress
                        value={sub.calculatedProgress}
                        color={sub.calculatedProgress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setTargetSubId(sub.id);
                        setShowTaskModal(true);
                      }}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Ação
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-5 space-y-3">
                  {subTasks.length === 0 ? (
                    <p className="text-xs text-gray-500 italic py-2">
                      Nenhuma tarefa vinculada a esta etapa.
                    </p>
                  ) : (
                    subTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                          task.status === 'completed'
                            ? 'bg-[#0a0d16] border-[#181d2c]'
                            : 'bg-[#121626] border-[#22293e]'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                task.status === 'completed'
                                  ? 'success'
                                  : task.priority === 'urgent'
                                  ? 'danger'
                                  : 'default'
                              }
                            >
                              {task.priority}
                            </Badge>
                            <span className="text-[11px] font-mono uppercase text-gray-400">
                              {task.taskType.replace('_', ' ')}
                            </span>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3" />
                              {task.estimatedMinutes}m
                            </span>
                          </div>
                          <span
                            className={`text-sm font-semibold block ${
                              task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-100'
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Link href={`/smart-task/${task.id}`}>
                            <Button size="sm" variant="secondary">
                              <Play className="w-3 h-3 text-indigo-400" /> Ferramenta
                            </Button>
                          </Link>
                          {task.status === 'completed' ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReopenTask(task.id)}
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Reabrir
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleCompleteTask(task.id)}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Concluir
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal: New Submission */}
      {showSubModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-[#0e121e] border-[#29324a]">
            <CardHeader>
              <CardTitle className="text-base">Adicionar Etapa / Submissão</CardTitle>
              <CardDescription>Crie uma fase intermediária para a missão.</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateSubmission}>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Título da Etapa *</label>
                  <input
                    type="text"
                    required
                    value={subTitle}
                    onChange={(e) => setSubTitle(e.target.value)}
                    placeholder="Ex: Fase 2 - Validação de Oferta"
                    className="w-full px-3 py-2 rounded-lg bg-[#151a2b] border border-[#232a3f] text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Descrição</label>
                  <textarea
                    rows={2}
                    value={subDescription}
                    onChange={(e) => setSubDescription(e.target.value)}
                    placeholder="O que precisa ser concluído nesta etapa?"
                    className="w-full px-3 py-2 rounded-lg bg-[#151a2b] border border-[#232a3f] text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </CardContent>
              <div className="p-5 pt-0 flex justify-end gap-3">
                <Button variant="ghost" size="sm" onClick={() => setShowSubModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm">
                  Salvar Etapa
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal: New Task */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-[#0e121e] border-[#29324a]">
            <CardHeader>
              <CardTitle className="text-base">Cadastrar Tarefa no Smart Task Engine</CardTitle>
              <CardDescription>Ações com ferramentas e cálculo determinístico de XP.</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateTask}>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Título da Ação *</label>
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Ex: Leitura Bíblica de Provérbios 3"
                    className="w-full px-3 py-2 rounded-lg bg-[#151a2b] border border-[#232a3f] text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Tipo de Ferramenta</label>
                    <select
                      value={taskType}
                      onChange={(e) => setTaskType(e.target.value as TaskType)}
                      className="w-full px-3 py-2 rounded-lg bg-[#151a2b] border border-[#232a3f] text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="simple">Tarefa Simples (Checklist)</option>
                      <option value="bible_reading">Leitura Bíblica (Escrituras Reais)</option>
                      <option value="reading">Leitura de Livros (Páginas)</option>
                      <option value="study">Estudo & Pomodoro (Flashcards)</option>
                      <option value="workout">Treino Físico (Cargas & Séries)</option>
                      <option value="numeric_goal">Meta Numérica (Progresso)</option>
                      <option value="timed">Cronometrada (Tempo Gasto)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Etapa Vinculada</label>
                    <select
                      value={targetSubId}
                      onChange={(e) => setTargetSubId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#151a2b] border border-[#232a3f] text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Ação Direta da Missão</option>
                      {submissions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Prioridade</label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                      className="w-full px-3 py-2 rounded-lg bg-[#151a2b] border border-[#232a3f] text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Dificuldade</label>
                    <select
                      value={taskDifficulty}
                      onChange={(e) => setTaskDifficulty(e.target.value as TaskDifficulty)}
                      className="w-full px-3 py-2 rounded-lg bg-[#151a2b] border border-[#232a3f] text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="easy">Fácil</option>
                      <option value="medium">Média</option>
                      <option value="hard">Difícil</option>
                      <option value="epic">Épica</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Duração (min)</label>
                    <input
                      type="number"
                      min={5}
                      max={480}
                      value={taskMinutes}
                      onChange={(e) => setTaskMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-[#151a2b] border border-[#232a3f] text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </CardContent>
              <div className="p-5 pt-0 flex justify-end gap-3">
                <Button variant="ghost" size="sm" onClick={() => setShowTaskModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm">
                  Salvar Ação
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
