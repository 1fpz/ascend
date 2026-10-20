import React from 'react';
import { Card, CardContent } from './card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  badgeText?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-indigo-400 bg-indigo-950/60 border-indigo-800/40',
  badgeText,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('relative overflow-hidden hover:border-[#2f3956] transition-all', className)}>
      <CardContent className="p-5 flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{title}</p>
          <div className="text-2xl font-bold tracking-tight text-white">{value}</div>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          {badgeText && (
            <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/30">
              {badgeText}
            </span>
          )}
        </div>
        <div className={cn('p-2.5 rounded-lg border', iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  );
}
