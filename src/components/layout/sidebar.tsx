'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Target,
  Network,
  Calendar,
  Repeat,
  Library,
  User,
  Award,
  BarChart2,
  Settings,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Minhas Missões', href: '/missions', icon: Target },
  { name: 'Mission Tree', href: '/missions/tree', icon: Network },
  { name: 'Planner Diário', href: '/planner', icon: Calendar },
  { name: 'Hábitos & Rotinas', href: '/habits', icon: Repeat },
  { name: 'Biblioteca de Trilhas', href: '/library', icon: Library },
  { name: 'Perfil RPG', href: '/character', icon: User },
  { name: 'Conquistas', href: '/achievements', icon: Award },
  { name: 'Life Analytics', href: '/analytics', icon: BarChart2 },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-[#1c2235] bg-[#0c0f18] min-h-screen p-4 select-none shrink-0">
      {/* Brand Logo */}
      <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-3 mb-6 group">
        <div className="p-2 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 group-hover:border-indigo-400 transition-colors">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <span className="font-extrabold text-base tracking-wider text-white">PROJECT ASCEND</span>
          <span className="block text-[10px] uppercase font-mono tracking-widest text-indigo-400">
            Evolution OS
          </span>
        </div>
      </Link>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm font-semibold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#141926]'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-indigo-400' : 'text-gray-400')} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="pt-4 border-t border-[#1c2235] text-[11px] text-gray-500 flex items-center justify-between px-2">
        <span>v0.1.0 MVP Determinístico</span>
        <span className="px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/40 text-emerald-400 text-[10px] font-mono">
          Sem IA
        </span>
      </div>
    </aside>
  );
}
