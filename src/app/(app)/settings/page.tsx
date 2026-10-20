'use client';

import React, { useState } from 'react';
import { Settings, Globe, Download, Trash2, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getRepository } from '@/lib/store';
import { AccountCard } from '@/components/ui/account-card';
import { useAuth } from '@/lib/auth-context';

export default function SettingsPage() {
  const { user } = useAuth();
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const [saved, setSaved] = useState(false);

  const handleExportData = () => {
    const repo = getRepository();
    const data = repo.getState();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-ascend-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (confirm('Tem certeza de que deseja restaurar as configurações iniciais?')) {
      if (typeof window !== 'undefined') {
        // Limpa o slot do usuário atual (chaves são por usuário).
        const slot = user?.id ? `project_ascend_store_v1:${user.id}` : 'project_ascend_store_v1:local';
        localStorage.removeItem(slot);
        localStorage.removeItem(`${slot}:updated_at`);
        // também remove a chave legada compartilhada
        localStorage.removeItem('project_ascend_store_v1');
        window.location.reload();
      }
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#1c2235] pb-5">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          Configurações do Sistema
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Preferências de fuso horário, soberania e exportação total de dados (LGPD).
        </p>
      </div>

      {/* Timezone Preference */}
      <Card className="border-[#20273c] bg-[#0d111d]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            Fuso Horário & Calendário
          </CardTitle>
          <CardDescription>
            Garante que datas de hábitos e prazos de tarefas coincidam exatamente com seu dia civil.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Fuso Horário Ativo</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#141828] border border-[#232a3f] text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="America/Sao_Paulo">Brasília (GMT-3) — America/Sao_Paulo</option>
              <option value="UTC">UTC (Tempo Universal Coordenado)</option>
              <option value="America/New_York">Nova York (EST / EDT)</option>
              <option value="Europe/Lisbon">Lisboa (WET / WEST)</option>
            </select>
          </div>
          <Button size="sm" onClick={handleSave}>
            {saved ? (
              <>
                <Check className="w-4 h-4 mr-1 text-emerald-400" /> Salvo
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1" /> Salvar Preferência
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Data Sovereignty / LGPD Export */}
      <Card className="border-[#20273c] bg-[#0d111d]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-400" />
            Exportação Total de Dados (Soberania & Backup)
          </CardTitle>
          <CardDescription>
            Faça download de todas as suas missões, tarefas, livro-razão de XP e hábitos em formato JSON legível.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-gray-400">
            Nenhum dado é retido de forma proprietária. Você possui propriedade completa sobre seus registros.
          </p>
          <Button variant="secondary" size="sm" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-1" /> Exportar Dados (.json)
          </Button>
        </CardContent>
      </Card>

      {/* Account & Cloud Sync (Supabase, por usuário) */}
      <AccountCard />

      {/* Danger Zone: Reset Account */}
      <Card className="border-rose-900/30 bg-[#140c0f]">
        <CardHeader>
          <CardTitle className="text-base text-rose-400 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-400" />
            Zona de Perigo
          </CardTitle>
          <CardDescription className="text-rose-300/70">
            Restaura o estado inicial de demonstração.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="danger" size="sm" onClick={handleReset}>
            Restaurar Banco Inicial
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
