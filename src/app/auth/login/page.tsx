'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, configured, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Espera o bootstrap do store (user setado) antes de navegar, senão o
  // RequireAuth veria user=null e reenviaria pro login.
  const [pendingNav, setPendingNav] = useState(false);

  useEffect(() => {
    if (pendingNav && user && !loading) {
      router.push('/dashboard');
    }
  }, [pendingNav, user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const errMsg = await signIn(email.trim(), password);
    if (errMsg) {
      setError(errMsg);
      setBusy(false);
      return;
    }
    if (!configured) {
      // Modo local: sem sessão, navega direto.
      router.push('/dashboard');
      return;
    }
    // Supabase: aguarda o effect acima quando user+loading resolverem.
    setPendingNav(true);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 flex flex-col justify-center items-center p-4">
      <Link href="/" className="flex items-center gap-2.5 mb-8">
        <div className="p-2 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
          <Shield className="w-6 h-6" />
        </div>
        <span className="font-black text-xl tracking-wider text-white">PROJECT ASCEND</span>
      </Link>

      <Card className="w-full max-w-md border-[#232a3f] bg-[#0d101c] shadow-2xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-bold text-white">Acessar Command Center</CardTitle>
          <CardDescription>Entre com suas credenciais seguras.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">E-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#141828] border border-[#232a3f] text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#141828] border border-[#232a3f] text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {!configured && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Supabase não configurado — você entrará em modo local (dados só neste navegador).
                </span>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full font-bold mt-2" disabled={busy}>
              {busy ? 'Entrando...' : 'Entrar no Sistema'}{' '}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>

            <div className="text-center text-xs text-gray-400 pt-2">
              Não possui uma conta?{' '}
              <Link href="/auth/register" className="text-indigo-400 hover:underline font-semibold">
                Cadastre-se
              </Link>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
