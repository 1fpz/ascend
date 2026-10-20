'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, configured, user, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Espera o bootstrap do store (user setado) antes de navegar — evita que o
  // RequireAuth reenvie pro login por ver user=null logo após o cadastro.
  const [pendingNav, setPendingNav] = useState(false);

  useEffect(() => {
    if (pendingNav && user && !loading) {
      router.push('/dashboard');
    }
  }, [pendingNav, user, loading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (password.length < 6) {
      setError('A senha precisa ter no mínimo 6 caracteres.');
      return;
    }

    setBusy(true);
    const result = await signUp(email.trim(), password);

    if (result === '__CHECK_EMAIL__') {
      // Confirmação de e-mail ligada: fica na tela avisando.
      setInfo(
        'Conta criada! Verifique seu e-mail para confirmar o cadastro e então faça login.'
      );
      setBusy(false);
      return;
    }
    if (result) {
      setError(result);
      setBusy(false);
      return;
    }
    if (!configured) {
      // Modo local: navega direto.
      router.push('/dashboard');
      return;
    }
    // Sessão ativa (confirmação desativada): aguarda o effect navegar.
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
          <CardTitle className="text-xl font-bold text-white">Criar Perfil de Conquistador</CardTitle>
          <CardDescription>Inicie sua ascensão com isolamento de dados no banco.</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Nome Completo</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#141828] border border-[#232a3f] text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

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
                  Supabase não configurado — cadastro funcionará só localmente (sem conta real).
                </span>
              </div>
            )}

            {info && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{info}</span>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full font-bold mt-2" disabled={busy}>
              {busy ? 'Criando conta...' : 'Iniciar Ascensão'}{' '}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>

            <div className="text-center text-xs text-gray-400 pt-2">
              Já possui uma conta?{' '}
              <Link href="/auth/login" className="text-indigo-400 hover:underline font-semibold">
                Entrar
              </Link>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
