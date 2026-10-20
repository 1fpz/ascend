'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield,
  Zap,
  Target,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 flex flex-col">
      {/* Navbar */}
      <header className="h-20 border-b border-[#1c2235] bg-[#0c0f18]/80 backdrop-blur-md px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-wider text-white">PROJECT ASCEND</span>
            <span className="block text-[10px] uppercase font-mono tracking-widest text-indigo-400">
              Personal Evolution OS
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              Entrar
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm">
              Acessar App <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28 px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-800/50 text-indigo-300 text-xs font-semibold">
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          <span>100% Determinístico | Zero Dependência de IA</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
          O Sistema Operacional para sua{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200">
            Evolução Pessoal
          </span>
        </h1>
        <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto">
          Conecte cada tarefa diária a missões reais de vida. Ganhe XP em atributos como
          Disciplina, Conhecimento e Saúde com regras transparentes e banco relacional seguro.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="w-full sm:w-auto font-bold text-base px-8 py-3">
              Iniciar Minha Jornada <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
          <Link href="/library">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Ver Trilhas Prontas
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:border-indigo-500/40 transition-colors">
            <CardContent className="p-6 space-y-3">
              <div className="p-3 w-fit rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-indigo-400">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Hierarquia Concreta de Missões</h3>
              <p className="text-sm text-gray-400">
                Áreas da vida &gt; Missões Primárias &gt; Submissões &gt; Ações Diárias. Progresso
                ponderado calculado matematicamente sem porcentagens aleatórias.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-indigo-500/40 transition-colors">
            <CardContent className="p-6 space-y-3">
              <div className="p-3 w-fit rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Gamificação RPG Adulta</h3>
              <p className="text-sm text-gray-400">
                Livro-razão de XP idempotente no servidor, 5 atributos centrais, níveis determinísticos
                e desbloqueio de conquistas verificado por fatos persistidos.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-indigo-500/40 transition-colors">
            <CardContent className="p-6 space-y-3">
              <div className="p-3 w-fit rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Smart Task Engine</h3>
              <p className="text-sm text-gray-400">
                Ferramentas especializadas para cada categoria de tarefa: Leitura Bíblica offline/online,
                Pomodoro, Treino com cargas, Flashcards e Metas Numéricas.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Acceptance Highlights */}
      <section className="py-12 border-t border-[#1c2235] bg-[#0c0f18]/50 px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <h2 className="text-center text-xs uppercase font-mono tracking-widest text-indigo-400">
            Construído sob Rigor de Engenharia de Software
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>PostgreSQL com Row Level Security</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Next.js 15 App Router & Strict TypeScript</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Testes Unitários Automatizados (Vitest)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Algoritmo de Priorização Determinístico</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Prevenção de Ciclos de Dependência</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instalação PWA Responsiva</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-[#1c2235] px-6 text-center text-xs text-gray-500">
        <p>Project Ascend © 2026 — Sistema de Evolução Pessoal Gamificada.</p>
        <p className="mt-1">Desenvolvido com arquitetura determinística de alta fidelidade sem IA.</p>
      </footer>
    </div>
  );
}
