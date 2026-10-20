'use client';

// ==============================================================================
// PROJECT ASCEND — ROUTE GUARD
// Envolve o grupo (app): segura o render até a sessão + store estarem prontos
// e redireciona para /auth/login quando não autenticado.
// Em modo local (Supabase não configurado), libera direto.
// ==============================================================================

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { configured, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!configured) return; // modo local: sem guarda
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [configured, loading, user, router]);

  // Enquanto resolve sessão / carrega store, não renderiza o app.
  if (configured && (loading || !user)) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex flex-col items-center justify-center gap-3">
        <div className="w-7 h-7 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <span className="text-gray-400 font-mono text-xs">
          {loading ? 'Verificando sessão...' : 'Redirecionando...'}
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
