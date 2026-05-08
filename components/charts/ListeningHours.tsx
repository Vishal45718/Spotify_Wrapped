'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  data: { hour: number; count: number }[];
}

export function ListeningHours({ data }: Props) {
  // Map hour 0-23 to 12 AM - 11 PM labels
  const formattedData = data.map(d => {
    const period = d.hour >= 12 ? 'PM' : 'AM';
    const hour12 = d.hour % 12 || 12;
    return {
      name: `${hour12}${period}`,
      count: d.count,
    };
  });

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#aaa', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={10}
          />
          <YAxis 
            tick={{ fill: '#aaa', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            cursor={{ fill: '#ffffff10' }}
            contentStyle={{ backgroundColor: '#191414', border: '1px solid #333', borderRadius: '8px' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.count > 30 ? '#1DB954' : '#1DB95480'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
