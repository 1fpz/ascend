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
    <aside className="hidden md:flex flex-col w-64 border-r border-[#192138] bg-[#070910] min-h-screen p-4 select-none shrink-0 shadow-xl">
      {/* Brand Logo with Glow */}
      <Link href="/dashboard" className="flex items-center gap-3 px-3 py-3 mb-6 group">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600/30 to-purple-600/20 border border-indigo-500/50 text-indigo-400 group-hover:border-indigo-400 group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <span className="font-black text-base tracking-wider text-white flex items-center gap-1.5">
            PROJECT ASCEND
          </span>
          <span className="block text-[10px] uppercase font-mono tracking-widest text-indigo-400 font-bold">
            Evolution OS
          </span>
        </div>
      </Link>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                isActive
                  ? 'bg-indigo-600/20 text-white border border-indigo-500/40 shadow-sm font-semibold shadow-indigo-950'
                  : 'text-gray-400 hover:text-white hover:bg-[#111728]'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-500 rounded-r shadow-md shadow-indigo-400" />
              )}
              <Icon
                className={cn(
                  'w-4 h-4 transition-transform group-hover:scale-110',
                  isActive ? 'text-indigo-400' : 'text-gray-400 group-hover:text-indigo-300'
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="pt-4 border-t border-[#192138] text-[11px] text-gray-500 flex items-center justify-between px-2">
        <span>v0.1.0 MVP</span>
        <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/50 text-emerald-300 text-[10px] font-mono font-bold">
          Zero IA
        </span>
      </div>
    </aside>
  );
}
