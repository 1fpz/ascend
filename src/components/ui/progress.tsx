import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 - 100
  color?: string;
}

export function Progress({ value, className, color = 'bg-indigo-500', ...props }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-[#1b2234]', className)}
      {...props}
    >
      <div
        className={cn('h-full transition-all duration-300 ease-out rounded-full', color)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
