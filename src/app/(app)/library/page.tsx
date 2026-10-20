'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Library,
  Layers,
  Clock,
  CheckCircle2,
  Copy,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PRESET_MISSION_TEMPLATES, MissionTemplate } from '@/lib/catalog/templates';
import { getRepository } from '@/lib/store';
import { triggerRewardConfetti } from '@/lib/confetti';

export default function TaskLibraryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<MissionTemplate | null>(null);
  const [cloning, setCloning] = useState(false);

  const filtered = PRESET_MISSION_TEMPLATES.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClone = (templateId: string) => {
    setCloning(true);
    try {
      const repo = getRepository();
      const newMission = repo.cloneTemplate(templateId);
      triggerRewardConfetti();
      router.push(`/missions/${newMission.id}`);
    } catch (err: unknown) {
      console.error(err);
      setCloning(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2235] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Library className="w-6 h-6 text-indigo-400" />
            Biblioteca de Trilhas & Missões Prontas
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Selecione modelos pré-configurados com etapas e tarefas completas. Ao adicionar, cria-se
            uma cópia 100% independente no seu espaço pessoal.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Pesquisar trilha ou categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#121626] border border-[#22293e] text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((tpl) => (
          <Card
            key={tpl.id}
            className="border-[#20273c] bg-[#0d111d] hover:border-indigo-500/40 transition-all flex flex-col justify-between"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-mono text-indigo-400 uppercase font-semibold">
                  {tpl.category}
                </span>
                <Badge
                  variant={
                    tpl.difficulty === 'epic'
                      ? 'danger'
                      : tpl.difficulty === 'hard'
                      ? 'warning'
                      : 'default'
                  }
                >
                  {tpl.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold text-white mt-2">{tpl.title}</CardTitle>
              <CardDescription className="text-xs">{tpl.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <div className="flex items-center gap-4 text-xs text-gray-400 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  ~{tpl.estimatedDurationDays} dias
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-gray-500" />
                  {tpl.submissions.length} etapas estruturadas
                </span>
              </div>

              {/* Preview of first 2 submissions */}
              <div className="p-3 rounded-lg bg-[#111626] border border-[#1d2438] space-y-2 text-xs">
                <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-bold block">
                  Estrutura Pré-Configurada:
                </span>
                {tpl.submissions.slice(0, 2).map((sub, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="font-medium truncate">{sub.title}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#1c2235]">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedTemplate(tpl)}
                >
                  Ver Detalhes
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  disabled={cloning}
                  onClick={() => handleClone(tpl.id)}
                >
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Adicionar ao Meu Perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal: Template Structure Preview */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-[#0e121e] border-[#29324a] max-h-[85vh] flex flex-col">
            <CardHeader className="border-b border-[#1c2235]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-indigo-400 uppercase font-semibold">
                  {selectedTemplate.category}
                </span>
                <Badge variant="outline">{selectedTemplate.difficulty}</Badge>
              </div>
              <CardTitle className="text-xl font-bold mt-1 text-white">
                {selectedTemplate.title}
              </CardTitle>
              <CardDescription>{selectedTemplate.description}</CardDescription>
            </CardHeader>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-gray-400">
                Todas as Etapas e Tarefas ({selectedTemplate.submissions.length})
              </h4>
              {selectedTemplate.submissions.map((sub, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-[#121626] border border-[#20273c] space-y-2">
                  <h5 className="text-sm font-bold text-white">{sub.title}</h5>
                  <p className="text-xs text-gray-400">{sub.description}</p>
                  <div className="pt-2 space-y-1.5">
                    {sub.tasks.map((task, tIdx) => (
                      <div
                        key={tIdx}
                        className="p-2 rounded bg-[#0a0d16] border border-[#181d2c] flex items-center justify-between text-xs text-gray-300"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono">
                            {task.taskType}
                          </span>
                          <span>{task.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-500">
                          ~{task.estimatedMinutes}m
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-[#1c2235] flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTemplate(null)}
              >
                Fechar
              </Button>
              <Button
                size="sm"
                variant="primary"
                disabled={cloning}
                onClick={() => handleClone(selectedTemplate.id)}
              >
                <Copy className="w-3.5 h-3.5 mr-1" />
                Clonar Esta Trilha
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
