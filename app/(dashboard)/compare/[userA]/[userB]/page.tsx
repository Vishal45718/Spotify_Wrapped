import { ProcessedInsights } from '@/types/insights';
import Link from 'next/link';
import { ComparisonRadar } from '@/components/charts/ComparisonRadar';
import { TrackRow } from '@/components/ui/TrackRow';

async function getShareData(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/share?id=${id}`, {
    cache: 'no-store'
  });
  if (!res.ok) return null;
  return res.json() as Promise<ProcessedInsights>;
}

export default async function ComparePage({ params }: { params: { userA: string, userB: string } }) {
  const [dataA, dataB] = await Promise.all([
    getShareData(params.userA),
    getShareData(params.userB)
  ]);

  if (!dataA || !dataB) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-[#121212]">
        <h1 className="text-2xl text-gray-400">One or both comparison cards not found</h1>
        <Link href="/" className="px-6 py-2 bg-[#1DB954] text-black rounded-full font-bold">
          Make Your Own
        </Link>
      </div>
    );
  }

  // Find common tracks
  const tracksA = new Set(dataA.topTracks.map(t => t.id));
  const commonTracks = dataB.topTracks.filter(t => tracksA.has(t.id));

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto pb-24 space-y-12 bg-gradient-to-b from-[#191414] to-[#121212] text-white">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#1DB954] to-[#8A2BE2]">Friend Comparison</h1>
        <p className="text-gray-400 text-lg">Comparing two musical souls</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 rounded-[2rem] p-8 border border-white/10 shadow-xl backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-8 text-center text-white">Audio Aura Clash</h2>
          <ComparisonRadar scoresA={dataA.scores} scoresB={dataB.scores} />
        </div>
        
        <div className="bg-white/5 rounded-[2rem] p-8 border border-white/10 shadow-xl backdrop-blur-sm flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-8 text-center text-white">Compatibility Match</h2>
          <div className="text-center space-y-4 mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-[#1DB954] blur-xl opacity-20 rounded-full"></div>
              <p className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#1DB954] to-white relative z-10">
                {Math.round((commonTracks.length / Math.max(dataA.topTracks.length, 1)) * 100)}%
              </p>
            </div>
            <p className="text-gray-400 font-medium">Track Overlap</p>
          </div>
          
          {commonTracks.length > 0 && (
             <div className="mt-4 space-y-2">
               <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-4 text-center">Common Top Tracks</h3>
               <div className="bg-black/20 rounded-xl p-4">
                 {commonTracks.slice(0, 3).map((track, i) => (
                   <TrackRow key={track.id} track={track} index={i} />
                 ))}
               </div>
             </div>
          )}
        </div>
      </div>
      
      <div className="text-center mt-16">
        <Link 
          href="/" 
          className="px-8 py-4 bg-[#1DB954] text-black rounded-full font-bold text-lg shadow-[0_0_30px_rgba(29,185,84,0.3)] hover:scale-105 hover:shadow-[0_0_40px_rgba(29,185,84,0.4)] transition-all inline-block"
        >
          Create Your Own Wrapped
        </Link>
      </div>
    </main>
  );
}
