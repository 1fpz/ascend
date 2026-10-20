'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Target, Plus, ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getRepository } from '@/lib/store';
import { Mission, LifeArea, TaskPriority, TaskDifficulty } from '@/lib/types';

export default function MissionsPage() {
  const [mounted, setMounted] = useState(false);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);

  // Form states for new mission
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('high');
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('medium');
  const [dueDate, setDueDate] = useState('');
  const [areaId, setAreaId] = useState<string>('');

  const reloadData = () => {
    const repo = getRepository();
    const state = repo.getState();
    setMissions([...state.missions]);
    setLifeAreas([...state.lifeAreas]);
  };

  useEffect(() => {
    setMounted(true);
    reloadData();
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-400 font-mono text-xs">Carregando Missões...</div>
      </div>
    );
  }

  const filteredMissions =
    selectedArea === 'all'
      ? missions
      : missions.filter((m) => m.areaId === selectedArea);

  const handleCreateMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const repo = getRepository();
    repo.createMission({
      userId: 'user-default',
      title: title.trim(),
      description: description.trim(),
      purpose: purpose.trim(),
      priority,
      difficulty,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate || null,
      areaId: areaId || null,
      status: 'in_progress',
    });

    setTitle('');
    setDescription('');
    setPurpose('');
    setShowModal(false);
    reloadData();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2235] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-400" />
            Minhas Missões Primárias
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Objetivos centrais de vida estruturados em etapas e ações concretas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/missions/tree">
            <Button variant="secondary" size="sm">
              Visualizar Árvore
            </Button>
          </Link>
          <Button size="sm" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> Nova Missão
          </Button>
        </div>
      </div>

      {/* Area Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedArea('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
            selectedArea === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-[#131724] text-gray-400 hover:text-white'
          }`}
        >
          Todas ({missions.length})
        </button>
        {lifeAreas.map((area) => (
          <button
            key={area.id}
            onClick={() => setSelectedArea(area.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              selectedArea === area.id
                ? 'bg-indigo-600 text-white'
                : 'bg-[#131724] text-gray-400 hover:text-white'
            }`}
          >
            {area.name}
          </button>
        ))}
      </div>

      {/* Mission Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredMissions.map((mission) => (
          <Card key={mission.id} className="hover:border-indigo-500/40 transition-all flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <Badge
                  variant={
                    mission.status === 'completed'
                      ? 'success'
                      : mission.priority === 'urgent'
                      ? 'danger'
                      : 'default'
                  }
                >
                  {mission.status}
                </Badge>
                <span className="text-[11px] font-mono text-gray-400 uppercase">
                  Dificuldade: {mission.difficulty}
                </span>
              </div>
              <CardTitle className="text-lg font-bold text-white mt-2">{mission.title}</CardTitle>
              {mission.description && (
                <CardDescription className="line-clamp-2">{mission.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-400 font-semibold">
                  <span>Progresso Ponderado</span>
                  <span className="text-indigo-400">{mission.calculatedProgress}%</span>
                </div>
                <Progress
                  value={mission.calculatedProgress}
                  color={mission.calculatedProgress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#1b2234] text-xs text-gray-400">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  {mission.dueDate ? `Prazo: ${mission.dueDate}` : 'Sem prazo'}
                </span>
                <Link href={`/missions/${mission.id}`}>
                  <Button size="sm" variant="secondary">
                    Gerenciar <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Mission Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <Card className="w-full max-w-lg bg-[#0e121e] border-[#29324a] shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Cadastrar Nova Missão Primária</CardTitle>
              <CardDescription>
                Defina um objetivo concreto de vida para orientar suas ações.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateMission}>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Título da Missão *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Dominar Arquitetura Distribuída"
                    className="w-full px-3 py-2 rounded-lg bg-[#151a2b] border border-[#232a3f] text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Descrição / Escopo</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Resumo do que esta missão engloba..."
                    className="w-full px-3 py-2 rounded-lg bg-[#151a2b] border border-[#232a3f] text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Motivo / Propósito</label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Por que esta missão é essencial para seu futuro?"
                    className="w-full px-3 py-2 rounded-lg bg-[#151a2b] border border-[#232a3f] text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Prioridade</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TaskPriority)}
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
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as TaskDifficulty)}
                      className="w-full px-3 py-2 rounded-lg bg-[#151a2b] border border-[#232a3f] text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="easy">Fácil</option>
                      <option value="medium">Média</option>
                      <option value="hard">Difícil</option>
                      <option value="epic">Épica</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Área da Vida</label>
                    <select
                      value={areaId}
                      onChange={(e) => setAreaId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#151a2b] border border-[#232a3f] text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Nenhuma / Geral</option>
                      {lifeAreas.map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Prazo de Conclusão</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#151a2b] border border-[#232a3f] text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </CardContent>
              <div className="p-5 pt-0 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm">
                  Salvar Missão
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
