'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Deterministic entry into application
    router.push('/dashboard');
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

            <Button type="submit" className="w-full font-bold mt-2">
              Entrar no Sistema <ArrowRight className="w-4 h-4 ml-1" />
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
