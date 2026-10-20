// ==============================================================================
// PROJECT ASCEND — CLOUD SYNC (Supabase, por usuário)
// Cada usuário tem um snapshot do AppState numa linha `profiles`, isolada
// por RLS (auth.uid() = user_id). O motor continua local (rápido/offline);
// aqui apenas puxamos e empurramos o snapshot.
// ==============================================================================

import { createClient } from './supabase/client';
import type { AppState } from './store';

const TABLE = 'profiles';

export interface Snapshot {
  state: AppState;
  updatedAt: string;
}

/** Puxa o snapshot do usuário da nuvem. Retorna null se não existir ou não configurado. */
export async function fetchUserSnapshot(userId: string): Promise<Snapshot | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(TABLE)
    .select('state, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    state: data.state as AppState,
    updatedAt: (data.updated_at as string) || '',
  };
}

/** Envia (upsert) o snapshot do usuário para a nuvem. No-op se não configurado. */
export async function saveUserSnapshot(userId: string, state: AppState): Promise<void> {
  const supabase = createClient();
  if (!supabase) return;

  const { error } = await supabase
    .from(TABLE)
    .upsert(
      { user_id: userId, state, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );

  if (error) throw new Error(error.message);
}
