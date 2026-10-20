'use client';

import React from 'react';

interface HeatmapProps {
  completedDates: Record<string, number>; // date "YYYY-MM-DD" -> count
}

export function ConsistencyHeatmap({ completedDates }: HeatmapProps) {
  // Generate last 14 weeks (98 days)
  const totalDays = 98;
  const days: { dateStr: string; count: number; dayOfWeek: number }[] = [];

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = completedDates[dateStr] || 0;
    days.push({
      dateStr,
      count,
      dayOfWeek: d.getDay(),
    });
  }

  // Chunk into 14 weeks (7 days each)
  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-[#121624] border-[#1c2336]';
    if (count === 1) return 'bg-emerald-950 border-emerald-800 text-emerald-300';
    if (count === 2) return 'bg-emerald-800 border-emerald-600 text-white';
    if (count >= 3) return 'bg-emerald-500 border-emerald-400 text-white shadow-sm shadow-emerald-500/30';
    return 'bg-[#121624]';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="font-semibold text-gray-300">Mapa de Consistência (Últimos 90 dias)</span>
        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          <span>Menos</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-[#121624] border border-[#1c2336]" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-950 border border-emerald-800" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-800 border border-emerald-600" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500 border border-emerald-400" />
          <span>Mais</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex gap-1 min-w-max p-2.5 rounded-xl bg-[#080b13] border border-[#1c2338]">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1">
              {week.map((day) => (
                <div
                  key={day.dateStr}
                  title={`${day.dateStr}: ${day.count} ação(ões) executada(s)`}
                  className={`w-3 h-3 rounded-xs border transition-transform hover:scale-125 cursor-pointer ${getColorClass(
                    day.count
                  )}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
