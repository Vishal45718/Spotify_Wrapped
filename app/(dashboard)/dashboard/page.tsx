'use client';

import { useState } from 'react';
import { useInsights } from '@/hooks/useInsights';
import { TimeRange } from '@/types/spotify';
import { TimeRangeToggle } from '@/components/ui/TimeRangeToggle';
import { SkeletonDashboard } from '@/components/ui/SkeletonDashboard';
import { PersonalityBadge } from '@/components/ui/PersonalityBadge';
import { TrackRow } from '@/components/ui/TrackRow';
import { GenreDonut } from '@/components/charts/GenreDonut';
import { TopArtistsBar } from '@/components/charts/TopArtistsBar';
import { MoodRadar } from '@/components/charts/MoodRadar';
import { ListeningHours } from '@/components/charts/ListeningHours';
import { ShareCard } from '@/components/ui/ShareCard';
import { toPng } from 'html-to-image';
import { Download, Share2, Play } from 'lucide-react';
import { useShare } from '@/hooks/useShare';
import { m, LazyMotion, domAnimation } from 'framer-motion';
import Link from 'next/link';

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('long_term');
  const { data, loading, error } = useInsights(timeRange);
  const { shareInsights, isSharing } = useShare();

  const handleDownload = async () => {
    const node = document.getElementById('share-card-element');
    if (!node) return;
    try {
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 1 });
      const link = document.createElement('a');
      link.download = `wrapped-${timeRange}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
    }
  };

  const handleShareUrl = async () => {
    if (!data) return;
    const id = await shareInsights(data, timeRange);
    if (id) {
      const url = `${window.location.origin}/share/${id}`;
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-xl text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <a href="/api/auth" className="text-white underline">Login Again</a>
        </div>
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto pb-24">
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Your Dashboard</h1>
            <Link 
              href="/story" 
              className="flex items-center text-[#1DB954] hover:underline font-medium"
            >
              <Play className="w-4 h-4 mr-2 fill-[#1DB954]" /> Watch Your Story
            </Link>
          </div>
          <TimeRangeToggle value={timeRange} onChange={setTimeRange} disabled={loading} />
        </header>

        {loading || !data ? (
          <SkeletonDashboard />
        ) : (
          <m.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="Top Genre" value={data.topGenres[0]?.genre} />
              <StatCard title="Total Artists" value={data.topArtists.length.toString()} />
              <StatCard title="Unique Tracks" value={data.topTracks.length.toString()} />
              <StatCard title="Minutes" value={data.totalListeningMinutes.toLocaleString()} />
            </div>

            {/* Personality */}
            <div className="max-w-2xl mx-auto">
              <PersonalityBadge personality={data.personality} />
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                <h2 className="text-xl font-bold mb-6 text-[#1DB954]">Top Genres</h2>
                <GenreDonut data={data.topGenres} />
              </div>

              <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                <h2 className="text-xl font-bold mb-6 text-[#1DB954]">Your Audio Aura</h2>
                <MoodRadar scores={data.scores} />
              </div>

              <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                <h2 className="text-xl font-bold mb-6 text-[#1DB954]">Top Artists</h2>
                <TopArtistsBar artists={data.topArtists} />
              </div>

              <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                <h2 className="text-xl font-bold mb-6 text-[#1DB954]">Top Tracks</h2>
                <div className="space-y-1">
                  {data.topTracks.slice(0, 5).map((track, i) => (
                    <TrackRow key={track.id} track={track} index={i} />
                  ))}
                </div>
              </div>

              <div className="bg-white/5 rounded-3xl p-6 border border-white/10 lg:col-span-2">
                <h2 className="text-xl font-bold mb-6 text-[#1DB954]">Listening Clock</h2>
                <ListeningHours data={data.listeningHours} />
              </div>
            </div>
            
            {/* Hidden Share Card used for canvas generation */}
            <div className="absolute opacity-0 pointer-events-none -z-50 w-0 h-0 overflow-hidden">
              <ShareCard insights={data} />
            </div>
          </m.div>
        )}

        {/* Sticky Actions */}
        {!loading && data && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-50">
            <button 
              onClick={handleDownload}
              className="flex items-center px-6 py-3 bg-[#1DB954] text-black font-bold rounded-full shadow-[0_4px_20px_rgba(29,185,84,0.4)] hover:scale-105 transition-transform"
            >
              <Download className="w-5 h-5 mr-2" /> Download Card
            </button>
            <button 
              onClick={handleShareUrl}
              disabled={isSharing}
              className="flex items-center px-6 py-3 bg-white text-black font-bold rounded-full shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
            >
              <Share2 className="w-5 h-5 mr-2" /> {isSharing ? 'Saving...' : 'Get Link'}
            </button>
          </div>
        )}
      </main>
    </LazyMotion>
  );
}

function StatCard({ title, value }: { title: string, value: string }) {
  return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col justify-center items-center text-center">
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className="text-xl font-bold capitalize text-white">{value}</p>
    </div>
  );
}
