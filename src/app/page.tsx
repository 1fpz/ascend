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
    <div className="min-h-screen bg-[#06070a] text-gray-100 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Navbar with Glassmorphism */}
      <header className="h-20 border-b border-[#182136] bg-[#070910]/80 backdrop-blur-xl px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600/30 to-purple-600/20 border border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-600/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="font-black text-lg tracking-wider text-white">PROJECT ASCEND</span>
            <span className="block text-[10px] uppercase font-mono tracking-widest text-indigo-400 font-bold">
              Personal Evolution OS
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
              Entrar
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="shadow-lg shadow-indigo-600/30 font-bold">
              Acessar App <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-xs font-semibold shadow-inner">
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          <span>100% Determinístico | Zero Dependência de IA</span>
        </div>

        <h1 className="text-4xl md:text-7xl font-black tracking-tight text-white leading-tight">
          O Sistema Operacional para sua{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200">
            Evolução Pessoal
          </span>
        </h1>

        <p className="text-base md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Conecte cada ação diária a missões reais de vida. Ganhe XP em atributos como
          Disciplina, Conhecimento e Saúde com regras transparentes, ordenação topológica e banco relacional seguro.
        </p>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="w-full sm:w-auto font-black text-base px-8 py-3.5 shadow-xl shadow-indigo-600/40 hover:shadow-indigo-500/50">
              Iniciar Minha Jornada <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/library">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto border-[#222c44]">
              Explorar Trilhas Prontas
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Pillars with High Contrast & Glow */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-[#1b233a] bg-[#0c101c] hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-950/60 transition-all p-2">
            <CardContent className="p-6 space-y-4">
              <div className="p-3 w-fit rounded-xl bg-indigo-950/80 border border-indigo-700/50 text-indigo-400 shadow-sm shadow-indigo-950">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Hierarquia Concreta de Missões</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Áreas da Vida &gt; Missões Primárias &gt; Submissões &gt; Ações Diárias. Progresso
                ponderado calculado matematicamente sem porcentagens inventadas.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#1b233a] bg-[#0c101c] hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-950/60 transition-all p-2">
            <CardContent className="p-6 space-y-4">
              <div className="p-3 w-fit rounded-xl bg-emerald-950/80 border border-emerald-700/50 text-emerald-400 shadow-sm shadow-emerald-950">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Gamificação RPG Adulta</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Livro-razão de XP idempotente no servidor, 5 atributos centrais, níveis determinísticos
                e desbloqueio de conquistas verificado por fatos persistidos.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#1b233a] bg-[#0c101c] hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-950/60 transition-all p-2">
            <CardContent className="p-6 space-y-4">
              <div className="p-3 w-fit rounded-xl bg-purple-950/80 border border-purple-700/50 text-purple-400 shadow-sm shadow-purple-950">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Smart Task Engine</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Ferramentas reais para cada categoria de tarefa: Leitura Bíblica offline em português,
                Pomodoro com ruído marrom sintético, Treino com cargas e Flashcards SM-2.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Acceptance Highlights */}
      <section className="py-14 border-t border-[#182136] bg-[#070912]/70 px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-center text-xs uppercase font-mono tracking-widest text-indigo-400 font-bold">
            Construído sob Rigor de Engenharia de Software
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2 text-sm text-gray-300">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0c0f1a] border border-[#1c2438]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>PostgreSQL com Row Level Security</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0c0f1a] border border-[#1c2438]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Next.js 15 App Router & Strict Types</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0c0f1a] border border-[#1c2438]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>23 Testes Unitários Automatizados</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0c0f1a] border border-[#1c2438]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Priorização Determinística do Planner</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0c0f1a] border border-[#1c2438]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Detecção de Ciclos no Grafo (DFS)</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0c0f1a] border border-[#1c2438]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sons Sintéticos em Web Audio API</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-[#182136] px-6 text-center text-xs text-gray-500">
        <p>Project Ascend © 2026 — Sistema de Evolução Pessoal Gamificada.</p>
        <p className="mt-1">Arquitetura determinística de alta fidelidade sem IA.</p>
      </footer>
    </div>
  );
}
