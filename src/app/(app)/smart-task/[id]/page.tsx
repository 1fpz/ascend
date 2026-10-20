'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  Dumbbell,
  RotateCcw,
  Play,
  Pause,
  Plus,
  Trash2,
  Bookmark,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getRepository } from '@/lib/store';
import { triggerRewardConfetti } from '@/lib/confetti';
import { EMBEDDED_SCRIPTURES, BiblePassage } from '@/lib/bible';
import { TaskItem } from '@/lib/types';

export default function SmartTaskWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params?.id as string;

  const [mounted, setMounted] = useState(false);
  const [task, setTask] = useState<TaskItem | null>(null);

  // Bible Reader States
  const [selectedPassageKey, setSelectedPassageKey] = useState<string>('proverbios-3');
  const [reflection, setReflection] = useState<string>('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Pomodoro / Study Timer States
  const [studyMinutes, setStudyMinutes] = useState(25);
  const [studySeconds, setStudySeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Workout Logger States
  const [exercises, setExercises] = useState([
    { name: 'Supino Reto com Barra', sets: 4, reps: 10, weightKg: 70 },
    { name: 'Elevação Lateral', sets: 3, reps: 12, weightKg: 14 },
    { name: 'Tríceps Testa com Barra W', sets: 3, reps: 10, weightKg: 28 },
  ]);

  // Numeric Goal State
  const [numericCurrent, setNumericCurrent] = useState(0);
  const numericTarget = 10;
  const numericUnit = 'unidades';

  // Simple checklist
  const [checklist, setChecklist] = useState<{ id: string; text: string; done: boolean }[]>([
    { id: '1', text: 'Revisar escopo e critérios de aceitação', done: false },
    { id: '2', text: 'Executar tarefa sem distrações', done: false },
  ]);

  useEffect(() => {
    if (!taskId) return;
    const repo = getRepository();
    const t = repo.getTaskById(taskId);
    if (t) {
      setTask({ ...t });
      if (t.taskType === 'bible_reading' && t.config?.passageKey) {
        setSelectedPassageKey(t.config.passageKey as string);
      }
      if (t.resultData?.reflection) {
        setReflection(t.resultData.reflection as string);
      }
      if (t.resultData?.numericCurrent !== undefined) {
        setNumericCurrent(Number(t.resultData.numericCurrent));
      }
    }
    setMounted(true);
  }, [taskId]);

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setStudySeconds((prev) => {
          if (prev > 0) return prev - 1;
          setStudyMinutes((mPrev) => {
            if (mPrev > 0) return mPrev - 1;
            setTimerRunning(false);
            return 0;
          });
          return 59;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  if (!mounted || !task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="text-gray-400 font-mono text-xs">Carregando Smart Task Workspace...</div>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const handleCompleteTask = () => {
    const repo = getRepository();
    const resultPayload: Record<string, unknown> = {};

    if (task.taskType === 'bible_reading') {
      resultPayload.reflection = reflection;
      resultPayload.passageKey = selectedPassageKey;
      resultPayload.isFavorite = isFavorite;
    } else if (task.taskType === 'workout') {
      resultPayload.exercises = exercises;
    } else if (task.taskType === 'numeric_goal') {
      resultPayload.numericCurrent = numericCurrent;
      resultPayload.numericTarget = numericTarget;
    }

    const res = repo.completeTask(task.id, resultPayload);
    triggerRewardConfetti();
    setTask({ ...res.task });
  };

  const handleReopenTask = () => {
    const repo = getRepository();
    const reopened = repo.reopenTask(task.id);
    setTask({ ...reopened });
  };

  const passage: BiblePassage =
    EMBEDDED_SCRIPTURES[selectedPassageKey] || EMBEDDED_SCRIPTURES['proverbios-3'];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2235] pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-[#141926] border border-[#242b40] text-gray-300 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant={task.status === 'completed' ? 'success' : 'default'}>
                {task.status}
              </Badge>
              <span className="text-xs text-indigo-400 font-mono uppercase">
                {task.taskType.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">{task.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {task.status === 'completed' ? (
            <Button variant="ghost" size="sm" onClick={handleReopenTask}>
              <RotateCcw className="w-4 h-4 mr-1" /> Reabrir Ação
            </Button>
          ) : (
            <Button size="sm" onClick={handleCompleteTask}>
              <CheckCircle2 className="w-4 h-4 mr-1" /> Concluir e Ganhar XP
            </Button>
          )}
        </div>
      </div>

      {/* SPECIALIZED WORKSPACE TOOL BASED ON TASK TYPE */}

      {/* 1. BIBLE READING SMART MODULE */}
      {task.taskType === 'bible_reading' && (
        <div className="space-y-6">
          <Card className="border-indigo-900/40 bg-[#0d101c]">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1c2235]">
              <div>
                <CardTitle className="text-lg flex items-center gap-2 text-indigo-300">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  {passage.reference}
                </CardTitle>
                <CardDescription className="font-mono text-xs text-gray-400">
                  Tradução: {passage.translation} (Domínio Público)
                </CardDescription>
              </div>

              {/* Passage selector */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedPassageKey}
                  onChange={(e) => setSelectedPassageKey(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[#151929] border border-[#252c42] text-xs text-gray-200 focus:outline-none"
                >
                  <option value="proverbios-3">Provérbios 3 (Sabedoria & Confiança)</option>
                  <option value="salmos-23">Salmos 23 (O Bom Pastor)</option>
                  <option value="joao-1">João 1 (O Verbo Eterno)</option>
                  <option value="romanos-8">Romanos 8 (Mais que Vencedores)</option>
                </select>
                <Button
                  size="sm"
                  variant={isFavorite ? 'primary' : 'outline'}
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="h-8 px-2"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {/* Canonical Verses */}
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-2">
                {passage.verses.map((v) => (
                  <p key={v.verse} className="text-sm text-gray-200 leading-relaxed">
                    <span className="font-mono font-bold text-indigo-400 text-xs mr-2">
                      {v.verse}
                    </span>
                    {v.text}
                  </p>
                ))}
              </div>

              {/* Personal Reflection Note */}
              <div className="pt-4 border-t border-[#1c2235] space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block font-mono">
                  Minha Reflexão / Aplicação Prática:
                </label>
                <textarea
                  rows={3}
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="O que esta passagem instrui para sua rotina, decisões e integridade hoje?"
                  className="w-full px-3 py-2.5 rounded-lg bg-[#141829] border border-[#232a3f] text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. WORKOUT TASK MODULE */}
      {task.taskType === 'workout' && (
        <div className="space-y-6">
          <Card className="border-[#21293e] bg-[#0d111d]">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg flex items-center gap-2 text-rose-300">
                  <Dumbbell className="w-5 h-5 text-rose-400" />
                  Registro de Séries & Cargas
                </CardTitle>
                <CardDescription>Acompanhamento de volume e sobrecarga progressiva.</CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setExercises([
                    ...exercises,
                    { name: 'Novo Exercício', sets: 3, reps: 10, weightKg: 20 },
                  ])
                }
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Exercício
              </Button>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                {exercises.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-[#121626] border border-[#1f263c] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <input
                      type="text"
                      value={ex.name}
                      onChange={(e) => {
                        const copy = [...exercises];
                        copy[idx].name = e.target.value;
                        setExercises(copy);
                      }}
                      className="bg-transparent font-bold text-sm text-white focus:outline-none flex-1 border-b border-transparent focus:border-indigo-500"
                    />

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">Séries:</span>
                        <input
                          type="number"
                          value={ex.sets}
                          onChange={(e) => {
                            const copy = [...exercises];
                            copy[idx].sets = Number(e.target.value);
                            setExercises(copy);
                          }}
                          className="w-12 px-1.5 py-1 rounded bg-[#182035] border border-[#242d45] text-white text-center"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">Reps:</span>
                        <input
                          type="number"
                          value={ex.reps}
                          onChange={(e) => {
                            const copy = [...exercises];
                            copy[idx].reps = Number(e.target.value);
                            setExercises(copy);
                          }}
                          className="w-12 px-1.5 py-1 rounded bg-[#182035] border border-[#242d45] text-white text-center"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">Carga:</span>
                        <input
                          type="number"
                          value={ex.weightKg}
                          onChange={(e) => {
                            const copy = [...exercises];
                            copy[idx].weightKg = Number(e.target.value);
                            setExercises(copy);
                          }}
                          className="w-14 px-1.5 py-1 rounded bg-[#182035] border border-[#242d45] text-white text-center"
                        />
                        <span className="text-gray-400">kg</span>
                      </div>

                      <button
                        onClick={() => setExercises(exercises.filter((_, i) => i !== idx))}
                        className="text-gray-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3. STUDY & FOCUS / POMODORO MODULE */}
      {task.taskType === 'study' && (
        <div className="space-y-6">
          <Card className="border-indigo-900/40 bg-[#0d101c] text-center">
            <CardHeader>
              <CardTitle className="text-lg">Sessão de Foco & Pomodoro</CardTitle>
              <CardDescription>Execução imersiva sem interrupções</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-6xl font-black font-mono tracking-widest text-indigo-400">
                {String(studyMinutes).padStart(2, '0')}:{String(studySeconds).padStart(2, '0')}
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="font-bold px-8"
                >
                  {timerRunning ? (
                    <>
                      <Pause className="w-5 h-5 mr-1" /> Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-1" /> Iniciar Sessão
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setTimerRunning(false);
                    setStudyMinutes(25);
                    setStudySeconds(0);
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-1" /> Resetar (25m)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 4. NUMERIC GOAL MODULE */}
      {task.taskType === 'numeric_goal' && (
        <Card className="border-[#21293e] bg-[#0d111d]">
          <CardHeader>
            <CardTitle className="text-lg">Progresso da Meta Quantitativa</CardTitle>
            <CardDescription>Incremental e mensurável com precisão</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center gap-6">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setNumericCurrent((p) => Math.max(0, p - 1))}
                className="w-12 h-12 text-xl font-bold"
              >
                -
              </Button>
              <div className="text-center font-mono">
                <span className="text-4xl font-black text-white">{numericCurrent}</span>
                <span className="text-gray-400 text-lg"> / {numericTarget} {numericUnit}</span>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setNumericCurrent((p) => p + 1)}
                className="w-12 h-12 text-xl font-bold"
              >
                +
              </Button>
            </div>
            <Progress
              value={Math.min(100, Math.round((numericCurrent / numericTarget) * 100))}
              color="bg-emerald-500"
            />
          </CardContent>
        </Card>
      )}

      {/* 5. SIMPLE TASK / CHECKLIST MODULE */}
      {(task.taskType === 'simple' || task.taskType === 'checklist') && (
        <Card className="border-[#21293e] bg-[#0d111d]">
          <CardHeader>
            <CardTitle className="text-lg">Checklist de Execução</CardTitle>
            <CardDescription>Critérios claros para validação da conclusão</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() =>
                  setChecklist(
                    checklist.map((c) => (c.id === item.id ? { ...c, done: !c.done } : c))
                  )
                }
                className="p-3.5 rounded-lg bg-[#121626] border border-[#1f263c] flex items-center gap-3 cursor-pointer hover:bg-[#161c30] transition-colors"
              >
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 ${
                    item.done ? 'text-emerald-400' : 'text-gray-500'
                  }`}
                />
                <span
                  className={`text-sm ${item.done ? 'line-through text-gray-500' : 'text-gray-200'}`}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completion Confirmation Banner */}
      {task.status === 'completed' && (
        <Card className="border-emerald-800/40 bg-[#0d1814]">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-white">Tarefa Concluída com Sucesso!</h3>
                <p className="text-xs text-gray-400">
                  O registro de XP foi auditado e gravado no livro-razão de forma idempotente.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleReopenTask}>
              Reabrir Tarefa
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
