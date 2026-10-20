'use client';

import React, { useEffect, useState } from 'react';
import { UserCircle2, Cloud, CloudOff, LogOut, Check } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './card';
import { useAuth } from '@/lib/auth-context';

/**
 * Cartão de conta: mostra o usuário logado, o estado da sincronização
 * (automática, por usuário) e permite sair.
 */
export function AccountCard() {
  const { user, configured, signOut } = useAuth();
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Observa o "heartbeat" que o store grava a cada persistência (por usuário).
  useEffect(() => {
    if (!configured || !user) return;
    const key = `project_ascend_store_v1:${user.id}:updated_at`;

    const read = () => {
      const v = localStorage.getItem(key);
      if (v) setLastSaved(v);
    };
    read();

    const onStorage = (e: StorageEvent) => {
      if (e.key === key) read();
    };
    window.addEventListener('storage', onStorage);
    const interval = setInterval(read, 2000);
    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(interval);
    };
  }, [configured, user]);

  const handleSignOut = async () => {
    setBusy(true);
    try {
      await signOut();
    } finally {
      setBusy(false);
    }
  };

  if (!configured) {
    return (
      <Card className="border-amber-900/30 bg-[#14110a]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-amber-400">
            <CloudOff className="w-4 h-4" />
            Modo Local (sem conta)
          </CardTitle>
          <CardDescription className="text-amber-300/70">
            O Supabase não está configurado. Os dados ficam apenas neste navegador. Configure o
            Supabase para ter contas reais e sync entre dispositivos — veja o <b>DEPLOY.md</b>.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-[#20273c] bg-[#0d111d]">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <UserCircle2 className="w-4 h-4 text-indigo-400" />
          Conta & Sincronização
        </CardTitle>
        <CardDescription>
          Seus dados são salvos automaticamente por usuário e sincronizados com a nuvem.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-[#141828] border border-[#232a3f]">
          <Cloud className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {user?.email || 'usuário'}
            </p>
            <p className="text-[11px] text-gray-500 font-mono">
              {lastSaved
                ? `Sincronizado: ${new Date(lastSaved).toLocaleString('pt-BR')}`
                : 'Aguardando primeira sincronização...'}
            </p>
          </div>
          <span className="ml-auto flex items-center gap-1 text-[11px] text-emerald-400 shrink-0">
            <Check className="w-3.5 h-3.5" /> Auto
          </span>
        </div>

        <Button variant="danger" size="sm" onClick={handleSignOut} disabled={busy}>
          <LogOut className="w-4 h-4 mr-1" /> {busy ? 'Saindo...' : 'Sair da Conta'}
        </Button>
      </CardContent>
    </Card>
  );
}
