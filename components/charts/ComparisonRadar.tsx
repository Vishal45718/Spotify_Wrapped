'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Scores } from '@/types/insights';

interface Props {
  scoresA: Scores;
  scoresB: Scores;
}

export function ComparisonRadar({ scoresA, scoresB }: Props) {
  const data = [
    { subject: 'Mood', A: scoresA.mood, B: scoresB.mood, fullMark: 100 },
    { subject: 'Energy', A: scoresA.energy, B: scoresB.energy, fullMark: 100 },
    { subject: 'Discovery', A: scoresA.discovery, B: scoresB.discovery, fullMark: 100 },
    { subject: 'Diversity', A: scoresA.diversity, B: scoresB.diversity, fullMark: 100 },
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#333" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#aaa', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="User A" dataKey="A" stroke="#1DB954" fill="#1DB954" fillOpacity={0.5} />
          <Radar name="User B" dataKey="B" stroke="#8A2BE2" fill="#8A2BE2" fillOpacity={0.5} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#191414', border: '1px solid #333', borderRadius: '8px' }}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
