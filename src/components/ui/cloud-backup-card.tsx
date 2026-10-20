'use client';

import React, { useEffect, useState } from 'react';
import { Cloud, CloudUpload, CloudDownload, Check, AlertTriangle } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './card';
import {
  isCloudConfigured,
  backupToCloud,
  restoreFromCloud,
  getCloudBackupInfo,
  CloudBackupInfo,
} from '@/lib/sync';

type Status = { kind: 'idle' | 'busy' | 'ok' | 'err'; msg: string };

export function CloudBackupCard() {
  const [configured, setConfigured] = useState(false);
  const [syncCode, setSyncCode] = useState('');
  const [info, setInfo] = useState<CloudBackupInfo | null>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle', msg: '' });

  useEffect(() => {
    setConfigured(isCloudConfigured());
  }, []);

  const handleBackup = async () => {
    setStatus({ kind: 'busy', msg: 'Enviando backup...' });
    try {
      const res = await backupToCloud(syncCode);
      setInfo(res);
      setStatus({ kind: 'ok', msg: 'Backup enviado com sucesso.' });
    } catch (e: unknown) {
      setStatus({ kind: 'err', msg: e instanceof Error ? e.message : 'Falha ao enviar.' });
    }
  };

  const handleCheck = async () => {
    setStatus({ kind: 'busy', msg: 'Verificando...' });
    try {
      const res = await getCloudBackupInfo(syncCode);
      setInfo(res);
      setStatus(
        res
          ? { kind: 'ok', msg: 'Backup encontrado na nuvem.' }
          : { kind: 'err', msg: 'Nenhum backup para este código.' }
      );
    } catch (e: unknown) {
      setStatus({ kind: 'err', msg: e instanceof Error ? e.message : 'Falha ao verificar.' });
    }
  };

  const handleRestore = async () => {
    if (!confirm('Restaurar o backup da nuvem? Os dados atuais serão substituídos.')) return;
    setStatus({ kind: 'busy', msg: 'Restaurando...' });
    try {
      await restoreFromCloud(syncCode);
      // a página recarrega dentro de restoreFromCloud
    } catch (e: unknown) {
      setStatus({ kind: 'err', msg: e instanceof Error ? e.message : 'Falha ao restaurar.' });
    }
  };

  return (
    <Card className="border-[#20273c] bg-[#0d111d]">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Cloud className="w-4 h-4 text-indigo-400" />
          Backup na Nuvem (Supabase)
        </CardTitle>
        <CardDescription>
          Sobe seus dados pra nuvem usando um código de sincronização. Assim você recupera tudo em
          outro dispositivo ou depois de limpar o navegador.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!configured ? (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Supabase não configurado. Preencha{' '}
              <code className="font-mono bg-[#161c2e] px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code>{' '}
              e{' '}
              <code className="font-mono bg-[#161c2e] px-1 rounded">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </code>{' '}
              e reinicie o servidor. Consulte o <b>DEPLOY.md</b>.
            </span>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">
                Código de Sincronização
              </label>
              <input
                type="text"
                value={syncCode}
                onChange={(e) => setSyncCode(e.target.value)}
                placeholder="ex: minha-frase-secreta-2026"
                className="w-full px-3 py-2 rounded-lg bg-[#141828] border border-[#232a3f] text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-gray-500">
                É a “senha” do seu backup. Guarde em local seguro — quem tiver o código, restaura.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={handleBackup} disabled={status.kind === 'busy'}>
                <CloudUpload className="w-4 h-4 mr-1" /> Enviar Backup
              </Button>
              <Button variant="secondary" size="sm" onClick={handleCheck} disabled={status.kind === 'busy'}>
                Verificar
              </Button>
              <Button variant="danger" size="sm" onClick={handleRestore} disabled={status.kind === 'busy'}>
                <CloudDownload className="w-4 h-4 mr-1" /> Restaurar
              </Button>
            </div>

            {status.msg && (
              <div
                className={`text-xs p-2.5 rounded-lg border ${
                  status.kind === 'ok'
                    ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                    : status.kind === 'err'
                      ? 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                      : 'bg-[#141828] border-[#232a3f] text-gray-300'
                }`}
              >
                {status.kind === 'ok' && <Check className="w-3.5 h-3.5 inline mr-1" />}
                {status.msg}
              </div>
            )}

            {info?.updatedAt && (
              <p className="text-[11px] text-gray-500 font-mono">
                Último backup: {new Date(info.updatedAt).toLocaleString('pt-BR')}
                {info.sizeBytes != null ? ` · ${Math.round(info.sizeBytes / 1024)} KB` : ''}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
