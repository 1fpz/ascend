'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Target,
  Calendar,
  Repeat,
  Library,
  User,
  Volume2,
  VolumeX,
  BarChart2,
  Settings,
} from 'lucide-react';
import { soundFx } from '@/lib/audio';

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isAudioActive, setIsAudioActive] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands = [
    { title: 'Ir para o Dashboard', icon: Target, href: '/dashboard', category: 'Navegação' },
    { title: 'Abrir Planner Diário', icon: Calendar, href: '/planner', category: 'Navegação' },
    { title: 'Minhas Missões Primárias', icon: Target, href: '/missions', category: 'Navegação' },
    { title: 'Visualizador Mission Tree', icon: Target, href: '/missions/tree', category: 'Navegação' },
    { title: 'Hábitos & Rituais', icon: Repeat, href: '/habits', category: 'Navegação' },
    { title: 'Biblioteca de Trilhas', icon: Library, href: '/library', category: 'Navegação' },
    { title: 'Perfil RPG & Livro-Razão', icon: User, href: '/character', category: 'Navegação' },
    { title: 'Life Analytics', icon: BarChart2, href: '/analytics', category: 'Navegação' },
    { title: 'Configurações', icon: Settings, href: '/settings', category: 'Navegação' },
  ];

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  const toggleSound = () => {
    const active = soundFx.toggleBrownNoise();
    setIsAudioActive(active);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-24 p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-[#0d101a] border border-[#242c42] shadow-2xl glow-indigo overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1b2234]">
          <Search className="w-5 h-5 text-indigo-400" />
          <input
            autoFocus
            type="text"
            placeholder="Digite um comando ou navegue... (ESC para fechar)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white focus:outline-none placeholder:text-gray-500"
          />
          <kbd className="px-2 py-0.5 rounded bg-[#161a29] border border-[#252c42] text-[10px] font-mono text-gray-400">
            ESC
          </kbd>
        </div>

        {/* Action List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {/* Quick Audio Focus Toggle */}
          <button
            onClick={toggleSound}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#151a2b] text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-950/70 border border-indigo-700/40 text-indigo-400">
                {isAudioActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-sm font-bold text-white block">
                  {isAudioActive ? 'Parar Ruído Marrom de Foco' : 'Ativar Ruído Marrom de Foco (Web Audio)'}
                </span>
                <span className="text-xs text-gray-400">
                  Sons sintéticos em tempo real sem arquivos externos
                </span>
              </div>
            </div>
            <span className="text-xs font-mono text-indigo-400 font-semibold">
              {isAudioActive ? 'ATIVO' : 'LIGAR'}
            </span>
          </button>

          <div className="text-[10px] uppercase font-mono tracking-wider text-gray-500 px-3 pt-2">
            Navegação Rápida
          </div>

          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#151a2b] text-left transition-colors cursor-pointer text-gray-300 hover:text-white"
              >
                <Icon className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-medium">{item.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
