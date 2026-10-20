'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Network,
  ChevronDown,
  ChevronRight,
  Target,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  List,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getRepository } from '@/lib/store';
import { Mission, Submission, TaskItem } from '@/lib/types';

export default function MissionTreePage() {
  const [mounted, setMounted] = useState(false);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [expandedMissions, setExpandedMissions] = useState<Record<string, boolean>>({});
  const [expandedSubmissions, setExpandedSubmissions] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'flat'>('tree');

  useEffect(() => {
    const repo = getRepository();
    const state = repo.getState();
    setMissions(state.missions);
    setSubmissions(state.submissions);
    setTasks(state.tasks);

    // Expand first mission by default
    if (state.missions[0]) {
      setExpandedMissions({ [state.missions[0].id]: true });
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-400 font-mono text-xs">Carregando Mission Tree...</div>
      </div>
    );
  }

  const toggleMission = (id: string) => {
    setExpandedMissions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSubmission = (id: string) => {
    setExpandedSubmissions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredMissions = missions.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2235] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Network className="w-6 h-6 text-indigo-400" />
            Mission Tree — Visualizador Hierárquico
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Navegue pela árvore de objetivos: Missões Primárias &rarr; Etapas &rarr; Tarefas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-48 sm:w-64">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Pesquisar missão..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#121626] border border-[#22293e] text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'tree' ? 'flat' : 'tree')}
          >
            <List className="w-3.5 h-3.5 mr-1" />
            {viewMode === 'tree' ? 'Modo Lista' : 'Modo Árvore'}
          </Button>
        </div>
      </div>

      {/* Tree Visualization */}
      <div className="space-y-4">
        {filteredMissions.map((mission) => {
          const isExpanded = !!expandedMissions[mission.id];
          const missionSubs = submissions.filter((s) => s.missionId === mission.id);
          const directTasks = tasks.filter(
            (t) => t.missionId === mission.id && (!t.submissionId || t.submissionId === '')
          );

          return (
            <div key={mission.id} className="border border-[#1e2538] rounded-xl bg-[#0c101c] overflow-hidden">
              {/* Mission Root Node */}
              <div
                onClick={() => toggleMission(mission.id)}
                className="p-4 flex items-center justify-between bg-[#111626] hover:bg-[#151c30] cursor-pointer transition-colors border-b border-[#1b2236]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1 rounded bg-[#1a2236] text-gray-400">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                  <Target className="w-5 h-5 text-indigo-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{mission.title}</span>
                      <Badge variant={mission.status === 'completed' ? 'success' : 'default'}>
                        {mission.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-400">
                      {missionSubs.length} etapas cadastradas
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-28 text-right hidden sm:block">
                    <span className="text-xs font-mono font-bold text-indigo-400">
                      {mission.calculatedProgress}%
                    </span>
                    <Progress value={mission.calculatedProgress} color="bg-indigo-500" />
                  </div>
                  <Link
                    href={`/missions/${mission.id}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button size="sm" variant="ghost" className="h-8 px-2 text-xs">
                      Abrir <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Submissions & Sub-nodes */}
              {isExpanded && (
                <div className="p-4 pl-8 md:pl-12 space-y-4 border-t border-[#181f33] bg-[#0a0d16]">
                  {missionSubs.length === 0 && directTasks.length === 0 ? (
                    <p className="text-xs text-gray-500 italic py-2">
                      Esta missão ainda não possui nós filhos divididos.
                    </p>
                  ) : (
                    missionSubs.map((sub) => {
                      const isSubExpanded = !!expandedSubmissions[sub.id];
                      const subTasks = tasks.filter((t) => t.submissionId === sub.id);

                      return (
                        <div key={sub.id} className="border border-[#1e2538] rounded-lg bg-[#0e1322]">
                          {/* Submission Node Header */}
                          <div
                            onClick={() => toggleSubmission(sub.id)}
                            className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#141b2e] transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div className="p-0.5 rounded text-gray-400">
                                {isSubExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <Layers className="w-4 h-4 text-purple-400" />
                              <span className="text-xs font-bold text-gray-200">
                                {sub.title}
                              </span>
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                                {subTasks.length} ações
                              </Badge>
                            </div>
                            <span className="text-xs font-mono text-indigo-400">
                              {sub.calculatedProgress}%
                            </span>
                          </div>

                          {/* Task Leaf Nodes */}
                          {isSubExpanded && (
                            <div className="p-3 pl-8 space-y-2 border-t border-[#181f33] bg-[#090c16]">
                              {subTasks.length === 0 ? (
                                <p className="text-[11px] text-gray-500 italic">
                                  Nenhuma tarefa vinculada.
                                </p>
                              ) : (
                                subTasks.map((task) => (
                                  <div
                                    key={task.id}
                                    className="p-2.5 rounded border border-[#1b2234] bg-[#101424] flex items-center justify-between text-xs"
                                  >
                                    <div className="flex items-center gap-2">
                                      <CheckCircle2
                                        className={`w-3.5 h-3.5 ${
                                          task.status === 'completed'
                                            ? 'text-emerald-400'
                                            : 'text-gray-500'
                                        }`}
                                      />
                                      <span
                                        className={
                                          task.status === 'completed'
                                            ? 'line-through text-gray-500'
                                            : 'text-gray-200 font-medium'
                                        }
                                      >
                                        {task.title}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                                        <Clock className="w-2.5 h-2.5" />
                                        {task.estimatedMinutes}m
                                      </span>
                                      <Link href={`/smart-task/${task.id}`}>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 px-1.5 text-[10px]"
                                        >
                                          Executar
                                        </Button>
                                      </Link>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
