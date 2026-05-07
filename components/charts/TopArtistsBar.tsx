'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SpotifyArtist } from '@/types/spotify';

interface Props {
  artists: SpotifyArtist[];
}

export function TopArtistsBar({ artists }: Props) {
  const data = artists.slice(0, 10).map((a) => ({
    name: a.name,
    popularity: a.popularity,
    url: a.external_urls.spotify,
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#fff', fontSize: 12 }} 
            width={120} 
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            contentStyle={{ backgroundColor: '#191414', border: '1px solid #333', borderRadius: '8px' }}
          />
          <Bar dataKey="popularity" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index < 3 ? '#1DB954' : '#535353'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
