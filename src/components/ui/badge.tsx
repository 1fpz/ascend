import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'purple' | 'outline';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-indigo-950/70 text-indigo-300 border-indigo-800/40',
    success: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/40',
    warning: 'bg-amber-950/70 text-amber-300 border-amber-800/40',
    danger: 'bg-rose-950/70 text-rose-300 border-rose-800/40',
    purple: 'bg-violet-950/70 text-violet-300 border-violet-800/40',
    outline: 'bg-transparent text-gray-400 border-gray-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide uppercase',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
