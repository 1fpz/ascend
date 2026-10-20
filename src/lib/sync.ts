// ==============================================================================
// PROJECT ASCEND — CLOUD BACKUP / RESTORE (Supabase)
// Camada opcional de sincronização. O motor continua 100% no localStorage;
// aqui apenas sobe/baixa um snapshot completo do estado como JSON.
// ==============================================================================

import { createClient } from './supabase/client';
import type { AppState } from './store';

const TABLE = 'backups';

export interface CloudBackupInfo {
  updatedAt: string | null;
  sizeBytes: number | null;
}

export function isCloudConfigured(): boolean {
  return createClient() !== null;
}

/**
 * Envia o estado atual (localStorage) para a nuvem, sobrescrevendo o
 * registro associado a este syncCode.
 */
export async function backupToCloud(syncCode: string): Promise<CloudBackupInfo> {
  const supabase = createClient();
  if (!supabase) throw new Error('Supabase não configurado.');

  const code = syncCode.trim();
  if (!code) throw new Error('Informe um código de sincronização.');

  const raw = localStorage.getItem('project_ascend_store_v1');
  if (!raw) throw new Error('Nenhum dado local para enviar.');

  const payload = JSON.parse(raw) as AppState;

  const { error } = await supabase
    .from(TABLE)
    .upsert(
      { id: code, payload, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    );

  if (error) throw new Error(error.message);

  return {
    updatedAt: new Date().toISOString(),
    sizeBytes: new Blob([raw]).size,
  };
}

/**
 * Busca o snapshot da nuvem, grava no localStorage e recarrega a página
 * para que o store seja reconstruído a partir do dado restaurado.
 */
export async function restoreFromCloud(syncCode: string): Promise<void> {
  const supabase = createClient();
  if (!supabase) throw new Error('Supabase não configurado.');

  const code = syncCode.trim();
  if (!code) throw new Error('Informe um código de sincronização.');

  const { data, error } = await supabase
    .from(TABLE)
    .select('payload, updated_at')
    .eq('id', code)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Nenhum backup encontrado para este código.');

  localStorage.setItem('project_ascend_store_v1', JSON.stringify(data.payload));
  window.location.reload();
}

/**
 * Consulta metadados do backup sem restaurar (para exibir na UI).
 */
export async function getCloudBackupInfo(syncCode: string): Promise<CloudBackupInfo | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const code = syncCode.trim();
  if (!code) return null;

  const { data, error } = await supabase
    .from(TABLE)
    .select('payload, updated_at')
    .eq('id', code)
    .maybeSingle();

  if (error || !data) return null;

  return {
    updatedAt: data.updated_at,
    sizeBytes: new Blob([JSON.stringify(data.payload)]).size,
  };
}
