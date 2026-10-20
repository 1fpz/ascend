'use client';

// ==============================================================================
// PROJECT ASCEND — AUTH CONTEXT (Supabase)
// Fornece sessão, login, cadastro, logout e orquestra o carregamento do
// store por usuário. Também sinaliza quando o Supabase não está configurado
// (modo local/dev) para que o app continue funcionando sem contas.
// ==============================================================================

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { getRepository, AppState } from '@/lib/store';
import { fetchUserSnapshot, saveUserSnapshot } from '@/lib/sync';

interface AuthContextValue {
  /** false quando faltam as env vars do Supabase (modo local). */
  configured: boolean;
  /** true enquanto verifica/resolve a sessão inicial. */
  loading: boolean;
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}

const SAVE_DEBOUNCE_MS = 1200;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = React.useMemo(() => createClient(), []);
  const configured = supabase !== null;

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUserId = useRef<string | null>(null);

  const scheduleSave = useCallback((userId: string, state: AppState) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveUserSnapshot(userId, state).catch((err) => {
        console.error('[sync] falha ao salvar snapshot:', err);
      });
    }, SAVE_DEBOUNCE_MS);
  }, []);

  /** Carrega o store para um usuário e liga o listener de persistência. */
  const bootstrapUser = useCallback(
    async (u: User) => {
      currentUserId.current = u.id;
      const repo = getRepository();

      await repo.initForUser(u.id, () => fetchUserSnapshot(u.id));

      repo.setChangeListener((state) => {
        if (currentUserId.current) scheduleSave(currentUserId.current, state);
      });

      setUser(u);
      setLoading(false);
    },
    [scheduleSave]
  );

  // Sessão inicial + listener de mudanças de auth.
  useEffect(() => {
    if (!supabase) {
      // Modo local: carrega slot "local" sem contas.
      getRepository().initForUser('local').finally(() => setLoading(false));
      return;
    }

    let cancelled = false;

    supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      if (data.session?.user) {
        await bootstrapUser(data.session.user);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (cancelled) return;
      setSession(newSession);

      if (event === 'SIGNED_IN' && newSession?.user) {
        await bootstrapUser(newSession.user);
      } else if (event === 'SIGNED_OUT') {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        currentUserId.current = null;
        getRepository().setChangeListener(null);
        getRepository().resetToDefault();
        setUser(null);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
        setUser(newSession.user);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [supabase, bootstrapUser]);

  const signIn = useCallback<AuthContextValue['signIn']>(
    async (email, password) => {
      if (!supabase) return null;
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return error.message;
      // o listener SIGNED_IN faz o bootstrap do store
      return null;
    },
    [supabase]
  );

  const signUp = useCallback<AuthContextValue['signUp']>(
    async (email, password) => {
      if (!supabase) return null;
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return error.message;
      // Se a confirmação de e-mail estiver desativada, já há sessão.
      if (data.session) return null;
      return '__CHECK_EMAIL__';
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    // fallback caso o listener não dispare (ex: offline)
    if (currentUserId.current) {
      currentUserId.current = null;
      getRepository().setChangeListener(null);
      getRepository().resetToDefault();
      setUser(null);
      setSession(null);
    }
  }, [supabase]);

  const value: AuthContextValue = {
    configured,
    loading,
    session,
    user,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
