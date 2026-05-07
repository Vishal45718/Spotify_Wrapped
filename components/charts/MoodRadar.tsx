'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Scores } from '@/types/insights';

interface Props {
  scores: Scores;
}

export function MoodRadar({ scores }: Props) {
  const data = [
    { subject: 'Mood', A: scores.mood, fullMark: 100 },
    { subject: 'Energy', A: scores.energy, fullMark: 100 },
    { subject: 'Discovery', A: scores.discovery, fullMark: 100 },
    { subject: 'Diversity', A: scores.diversity, fullMark: 100 },
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#333" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#aaa', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="You" dataKey="A" stroke="#1DB954" fill="#1DB954" fillOpacity={0.5} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#191414', border: '1px solid #333', borderRadius: '8px' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
