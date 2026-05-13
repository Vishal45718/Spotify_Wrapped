'use client';

import { useState, useEffect } from 'react';
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
import { Download, Share2, Play, LogOut, User } from 'lucide-react';
import { useShare } from '@/hooks/useShare';
import { m, LazyMotion, domAnimation } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useToast } from '@/components/providers/ToastProvider';

const GenreTravelMap = dynamic(
  () => import('@/components/charts/GenreTravelMap'),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 aspect-[16/9] min-h-[200px] rounded-2xl bg-white/[0.04] animate-pulse border border-white/10" />
        <div className="rounded-2xl bg-white/[0.04] animate-pulse border border-white/10 h-64" />
      </div>
    ),
  }
);

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('long_term');
  const { data, loading, error } = useInsights(timeRange);
  const { shareInsights, isSharing } = useShare();
  const { toast } = useToast();
  const [userInfo, setUserInfo] = useState<{ displayName?: string; avatarUrl?: string; isDemo?: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(setUserInfo)
      .catch(() => {});
  }, []);

  const handleDownload = async () => {
    const node = document.getElementById('share-card-element');
    if (!node) return;
    try {
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `wrapped-${timeRange}.png`;
      link.href = dataUrl;
      link.click();
      toast('Card downloaded!', 'success');
    } catch (err) {
      console.error('Failed to download image', err);
      toast('Download failed. Try again.', 'error');
    }
  };

  const handleShareUrl = async () => {
    if (!data) return;
    const id = await shareInsights(data, timeRange);
    if (id) {
      const url = `${window.location.origin}/share/${id}`;
      await navigator.clipboard.writeText(url);
      toast('Share link copied to clipboard!', 'success');
    } else {
      toast('Failed to generate share link.', 'error');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500/50 p-8 rounded-2xl text-center max-w-md">
          <p className="text-red-400 mb-4 text-lg">{error}</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
              Retry
            </button>
            <a href="/api/auth/login" className="px-6 py-2 bg-[#1DB954] text-black rounded-full font-bold hover:bg-[#1ED760] transition-colors">
              Re-login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto pb-24">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-4">
            {/* User avatar */}
            {userInfo?.avatarUrl ? (
              <img src={userInfo.avatarUrl} alt="" className="w-12 h-12 rounded-full border-2 border-[#1DB954]/50 shadow-lg" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <User className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {userInfo?.displayName ? `${userInfo.displayName}'s Dashboard` : 'Your Dashboard'}
              </h1>
              <div className="flex items-center gap-4 mt-1">
                <Link href="/story" className="flex items-center text-[#1DB954] hover:underline font-medium text-sm">
                  <Play className="w-3.5 h-3.5 mr-1.5 fill-[#1DB954]" /> Watch Story
                </Link>
                {userInfo?.isDemo && (
                  <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
                    Demo Mode
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <TimeRangeToggle value={timeRange} onChange={setTimeRange} disabled={loading} />
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4 text-gray-400" />
            </button>
          </div>
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

              <m.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white/5 rounded-3xl p-6 border border-white/10 lg:col-span-2"
              >
                <h2 className="text-xl font-bold mb-1 text-[#1DB954]">Genre Travel Map</h2>
                <p className="text-gray-400 text-sm mb-6 max-w-2xl">
                  Follow the glow: each arc is a playful hop from your profile country to where your top genres took
                  root on the map.
                </p>
                <GenreTravelMap locationData={data.locationData} topGenres={data.topGenres} />
              </m.div>
            </div>
            
            {/* Hidden Share Card */}
            <div className="absolute opacity-0 pointer-events-none -z-50 w-0 h-0 overflow-hidden">
              <ShareCard insights={data} />
            </div>
          </m.div>
        )}

        {/* Sticky Actions */}
        {!loading && data && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-50">
            <button 
              onClick={handleDownload}
              className="flex items-center px-5 py-3 bg-[#1DB954] text-black font-bold rounded-full shadow-[0_4px_20px_rgba(29,185,84,0.4)] hover:scale-105 transition-transform text-sm"
            >
              <Download className="w-4 h-4 mr-2" /> Download
            </button>
            <button 
              onClick={handleShareUrl}
              disabled={isSharing}
              className="flex items-center px-5 py-3 bg-white text-black font-bold rounded-full shadow-lg hover:scale-105 transition-transform disabled:opacity-50 text-sm"
            >
              <Share2 className="w-4 h-4 mr-2" /> {isSharing ? 'Saving...' : 'Share'}
            </button>
          </div>
        )}
      </main>
    </LazyMotion>
  );
}

function StatCard({ title, value }: { title: string, value: string }) {
  return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col justify-center items-center text-center hover:bg-white/[0.08] transition-colors">
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className="text-xl font-bold capitalize text-white">{value}</p>
    </div>
  );
}
