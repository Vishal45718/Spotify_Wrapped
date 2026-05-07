'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getGenreColor } from '@/utils/color';

interface Props {
  data: { genre: string; count: number }[];
}

export function GenreDonut({ data }: Props) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="count"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getGenreColor(index)} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any, name: any) => [value, name]}
            contentStyle={{ backgroundColor: '#191414', border: 'none', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {data.map((entry, idx) => (
          <div key={entry.genre} className="flex items-center text-xs text-gray-300">
            <span 
              className="w-3 h-3 rounded-full mr-1 inline-block" 
              style={{ backgroundColor: getGenreColor(idx) }}
            />
            {entry.genre}
          </div>
        ))}
      </div>
    </div>
  );
}
