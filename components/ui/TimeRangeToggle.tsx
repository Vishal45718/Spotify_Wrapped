'use client';

import { TimeRange } from '@/types/spotify';
import { Clock, Calendar, CalendarDays } from 'lucide-react';

interface Props {
  value: TimeRange;
  onChange: (val: TimeRange) => void;
  disabled?: boolean;
}

export function TimeRangeToggle({ value, onChange, disabled }: Props) {
  const options: { label: string; value: TimeRange; icon: any }[] = [
    { label: '4 Weeks', value: 'short_term', icon: Clock },
    { label: '6 Months', value: 'medium_term', icon: Calendar },
    { label: 'All Time', value: 'long_term', icon: CalendarDays },
  ];

  return (
    <div className="flex p-1 space-x-1 bg-white/5 rounded-xl border border-white/10 w-fit mx-auto">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={`
              flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${isActive 
                ? 'bg-[#1DB954] text-black shadow-lg' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'}
            `}
          >
            <Icon className="w-4 h-4 mr-2" />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
