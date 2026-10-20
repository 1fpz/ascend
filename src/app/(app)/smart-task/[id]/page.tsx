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
  Volume2,
  VolumeX,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getRepository } from '@/lib/store';
import { triggerRewardConfetti } from '@/lib/confetti';
import { soundFx } from '@/lib/audio';
import { EMBEDDED_SCRIPTURES, BiblePassage } from '@/lib/bible';
import { calculateNextReview, ReviewGrade, FlashcardItem } from '@/lib/domain/spaced-repetition';
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
  const [isBrownNoiseActive, setIsBrownNoiseActive] = useState(false);

  // Flashcards Spaced Repetition (SM-2) States
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([
    {
      id: 'fc-1',
      front: 'O que define a idempotência em operações de concessão de XP?',
      back: 'Garantir que a repetição de uma mesma requisição não produza efeitos colaterais duplicados, utilizando uma chave única no banco.',
      category: 'Arquitetura',
      repetitions: 0,
      intervalDays: 1,
      easeFactor: 2.5,
      nextReviewDate: new Date().toISOString().split('T')[0],
    },
    {
      id: 'fc-2',
      front: 'Qual é a complexidade de tempo da detecção de ciclos por DFS em grafos direcionados?',
      back: 'O(V + E), onde V é o número de vértices (tarefas) e E é o número de arestas (dependências).',
      category: 'Estruturas de Dados',
      repetitions: 1,
      intervalDays: 2,
      easeFactor: 2.5,
      nextReviewDate: new Date().toISOString().split('T')[0],
    },
    {
      id: 'fc-3',
      front: 'Qual o princípio fundamental do Project Ascend em relação a IAs?',
      back: 'Zero uso de LLMs ou APIs sintéticas no MVP. Regras puramente determinísticas, banco relacional e integridade matemática.',
      category: 'Princípios do Produto',
      repetitions: 2,
      intervalDays: 6,
      easeFactor: 2.6,
      nextReviewDate: new Date().toISOString().split('T')[0],
    },
  ]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [lastReviewFeedback, setLastReviewFeedback] = useState<string | null>(null);

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
            soundFx.playRewardSound();
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
    soundFx.playRewardSound();
    triggerRewardConfetti();
    setTask({ ...res.task });
  };

  const handleReopenTask = () => {
    const repo = getRepository();
    const reopened = repo.reopenTask(task.id);
    setTask({ ...reopened });
  };

  const handleReviewCard = (grade: ReviewGrade) => {
    const card = flashcards[activeCardIndex];
    const today = new Date().toISOString().split('T')[0];
    const updated = calculateNextReview(card, grade, today);

    const copy = [...flashcards];
    copy[activeCardIndex] = {
      ...card,
      ...updated,
    };
    setFlashcards(copy);
    setIsCardFlipped(false);
    setLastReviewFeedback(
      `Revisado! Próxima repetição em ${updated.intervalDays} dia(s) (EF: ${updated.easeFactor}).`
    );
    setTimeout(() => setLastReviewFeedback(null), 3000);

    // Advance to next card
    setActiveCardIndex((prev) => (prev + 1) % flashcards.length);
  };

  const toggleFocusSound = () => {
    const active = soundFx.toggleBrownNoise();
    setIsBrownNoiseActive(active);
  };

  const passage: BiblePassage =
    EMBEDDED_SCRIPTURES[selectedPassageKey] || EMBEDDED_SCRIPTURES['proverbios-3'];

  const currentFlashcard = flashcards[activeCardIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2438] pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-xl bg-[#0e1322] border border-[#202942] text-gray-300 hover:text-white cursor-pointer transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant={task.status === 'completed' ? 'success' : 'default'}>
                {task.status}
              </Badge>
              <span className="text-xs text-indigo-400 font-mono uppercase font-bold">
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
            <Button size="sm" onClick={handleCompleteTask} className="shadow-lg shadow-indigo-600/30 font-bold">
              <CheckCircle2 className="w-4 h-4 mr-1" /> Concluir e Ganhar XP
            </Button>
          )}
        </div>
      </div>

      {/* SPECIALIZED WORKSPACE TOOL BASED ON TASK TYPE */}

      {/* 1. BIBLE READING SMART MODULE */}
      {task.taskType === 'bible_reading' && (
        <div className="space-y-6">
          <Card className="border-indigo-500/30 bg-gradient-to-br from-[#0e1220] via-[#0a0d16] to-[#070910] shadow-xl">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1b2338]">
              <div>
                <CardTitle className="text-xl flex items-center gap-2 text-indigo-300 font-bold">
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
                  className="px-3 py-1.5 rounded-xl bg-[#141829] border border-[#242c44] text-xs text-gray-200 focus:outline-none"
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
                  className="h-8 px-2.5"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              {/* Canonical Verses */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-3">
                {passage.verses.map((v) => (
                  <p key={v.verse} className="text-sm text-gray-200 leading-relaxed font-normal">
                    <span className="font-mono font-bold text-indigo-400 text-xs mr-2.5 select-none">
                      {v.verse}
                    </span>
                    {v.text}
                  </p>
                ))}
              </div>

              {/* Personal Reflection Note */}
              <div className="pt-4 border-t border-[#1b2338] space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block font-mono">
                  Minha Reflexão / Aplicação Prática:
                </label>
                <textarea
                  rows={3}
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="O que esta passagem instrui para sua rotina, integridade e decisões hoje?"
                  className="w-full px-4 py-3 rounded-xl bg-[#121626] border border-[#222b42] text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. STUDY & FOCUS / POMODORO / SPACED REPETITION FLASHCARDS MODULE */}
      {task.taskType === 'study' && (
        <div className="space-y-6">
          {/* Pomodoro Focus Timer */}
          <Card className="border-indigo-500/30 bg-[#0c101c] text-center p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1b2338] pb-4">
              <div className="text-left">
                <h3 className="text-lg font-bold text-white">Sessão Pomodoro & Foco Profundo</h3>
                <p className="text-xs text-gray-400">Trabalho focado sem distrações externas</p>
              </div>

              <button
                onClick={toggleFocusSound}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all cursor-pointer ${
                  isBrownNoiseActive
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/40'
                    : 'bg-[#141829] text-gray-400 border-[#242c44] hover:text-white'
                }`}
              >
                {isBrownNoiseActive ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isBrownNoiseActive ? 'Ruído Marrom Ativo' : 'Som Ruído Marrom'}</span>
              </button>
            </div>

            <div className="text-7xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 py-2">
              {String(studyMinutes).padStart(2, '0')}:{String(studySeconds).padStart(2, '0')}
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => setTimerRunning(!timerRunning)}
                className="font-bold px-8 shadow-md shadow-indigo-600/30"
              >
                {timerRunning ? (
                  <>
                    <Pause className="w-5 h-5 mr-1.5" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-1.5" /> Iniciar Foco
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
                className="border-[#232c44]"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" /> Resetar (25m)
              </Button>
            </div>
          </Card>

          {/* Spaced Repetition (SM-2) Flashcard Deck */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Deck de Flashcards (Repetição Espaçada SM-2)
              </h3>
              <span className="text-xs text-gray-400 font-mono">
                Cartão {activeCardIndex + 1} de {flashcards.length}
              </span>
            </div>

            {lastReviewFeedback && (
              <div className="p-2.5 rounded-lg bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-mono text-center animate-in fade-in">
                {lastReviewFeedback}
              </div>
            )}

            {/* 3D Flip Card */}
            <div
              onClick={() => setIsCardFlipped(!isCardFlipped)}
              className="p-8 rounded-2xl bg-gradient-to-br from-[#121626] to-[#0d101a] border border-[#232d47] min-h-[220px] flex flex-col justify-between cursor-pointer hover:border-indigo-500/50 transition-all shadow-xl group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                  {currentFlashcard.category}
                </span>
                <span className="text-xs font-mono text-gray-500">
                  {isCardFlipped ? 'Verso (Resposta)' : 'Frente (Pergunta) — Clique para Virar'}
                </span>
              </div>

              <div className="py-4 text-center">
                <h4 className="text-base md:text-lg font-bold text-white leading-relaxed">
                  {isCardFlipped ? currentFlashcard.back : currentFlashcard.front}
                </h4>
              </div>

              <div className="text-center text-[11px] text-gray-500 font-mono">
                Intervalo Atual: {currentFlashcard.intervalDays}d | Fator de Facilidade: {currentFlashcard.easeFactor}
              </div>
            </div>

            {/* SM-2 Recall Rating Buttons */}
            {isCardFlipped && (
              <div className="grid grid-cols-4 gap-2 pt-2 animate-in fade-in">
                <button
                  onClick={() => handleReviewCard(1)}
                  className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 font-bold text-xs hover:bg-rose-900 transition-colors cursor-pointer"
                >
                  1: Errei (1d)
                </button>
                <button
                  onClick={() => handleReviewCard(2)}
                  className="p-3 rounded-xl bg-amber-950/70 border border-amber-800 text-amber-300 font-bold text-xs hover:bg-amber-900 transition-colors cursor-pointer"
                >
                  2: Difícil
                </button>
                <button
                  onClick={() => handleReviewCard(3)}
                  className="p-3 rounded-xl bg-indigo-950/70 border border-indigo-800 text-indigo-300 font-bold text-xs hover:bg-indigo-900 transition-colors cursor-pointer"
                >
                  3: Bom
                </button>
                <button
                  onClick={() => handleReviewCard(4)}
                  className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 font-bold text-xs hover:bg-emerald-900 transition-colors cursor-pointer"
                >
                  4: Fácil (+Dias)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. WORKOUT TASK MODULE */}
      {task.taskType === 'workout' && (
        <div className="space-y-6">
          <Card className="border-[#21293e] bg-[#0d111d] shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg flex items-center gap-2 text-rose-300 font-bold">
                  <Dumbbell className="w-5 h-5 text-rose-400" />
                  Registro de Séries & Cargas
                </CardTitle>
                <CardDescription>Acompanhamento de volume e sobrecarga progressiva</CardDescription>
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
                className="border-[#26314c]"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Exercício
              </Button>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                {exercises.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#121626] border border-[#1f263c] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner"
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
                          className="w-12 px-1.5 py-1 rounded-lg bg-[#182035] border border-[#242d45] text-white text-center font-bold"
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
                          className="w-12 px-1.5 py-1 rounded-lg bg-[#182035] border border-[#242d45] text-white text-center font-bold"
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
                          className="w-14 px-1.5 py-1 rounded-lg bg-[#182035] border border-[#242d45] text-white text-center font-bold text-emerald-300"
                        />
                        <span className="text-gray-400">kg</span>
                      </div>

                      <button
                        onClick={() => setExercises(exercises.filter((_, i) => i !== idx))}
                        className="text-gray-500 hover:text-rose-400 p-1 cursor-pointer"
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

      {/* 4. NUMERIC GOAL MODULE */}
      {task.taskType === 'numeric_goal' && (
        <Card className="border-[#21293e] bg-[#0d111d] shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg">Progresso da Meta Quantitativa</CardTitle>
            <CardDescription>Incremental e mensurável com precisão matemática</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center gap-6">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setNumericCurrent((p) => Math.max(0, p - 1))}
                className="w-14 h-14 text-2xl font-bold rounded-2xl border-[#29334d]"
              >
                -
              </Button>
              <div className="text-center font-mono">
                <span className="text-5xl font-black text-white">{numericCurrent}</span>
                <span className="text-gray-400 text-lg"> / {numericTarget} {numericUnit}</span>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setNumericCurrent((p) => p + 1)}
                className="w-14 h-14 text-2xl font-bold rounded-2xl shadow-lg shadow-indigo-600/30"
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
        <Card className="border-[#21293e] bg-[#0d111d] shadow-xl">
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
                className="p-3.5 rounded-xl bg-[#121626] border border-[#1f263c] flex items-center gap-3 cursor-pointer hover:bg-[#161c30] transition-colors"
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
        <Card className="border-emerald-600/50 bg-[#091512] shadow-xl glow-emerald animate-in fade-in">
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
            <Button variant="outline" size="sm" onClick={handleReopenTask} className="border-emerald-700/60">
              Reabrir Tarefa
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
