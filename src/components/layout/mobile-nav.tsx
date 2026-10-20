'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Target, Calendar, Repeat, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOBILE_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Missões', href: '/missions', icon: Target },
  { name: 'Planner', href: '/planner', icon: Calendar },
  { name: 'Hábitos', href: '/habits', icon: Repeat },
  { name: 'Perfil', href: '/character', icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0c0f18] border-t border-[#1c2235] flex items-center justify-around px-2 z-50">
      {MOBILE_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center w-12 h-12 rounded-lg text-[10px] font-medium transition-colors',
              isActive ? 'text-indigo-400 font-bold' : 'text-gray-400 hover:text-gray-200'
            )}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
