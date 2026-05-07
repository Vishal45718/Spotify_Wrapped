'use client';

import { ProcessedInsights } from '@/types/insights';
import { SpotifyUser } from '@/types/spotify';

interface Props {
  insights: ProcessedInsights;
  user?: SpotifyUser;
}

export function ShareCard({ insights, user }: Props) {
  return (
    <div 
      id="share-card-element" 
      className="relative w-[1080px] h-[1920px] bg-gradient-to-br from-[#191414] via-[#121212] to-[#1DB954]/20 p-16 flex flex-col justify-between overflow-hidden scale-[0.25] origin-top-left absolute top-[-9999px]"
    >
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#1DB954] rounded-full mix-blend-screen filter blur-[200px] opacity-40"></div>
      
      <div className="z-10">
        <h1 className="text-[120px] font-black leading-none text-white tracking-tighter mb-4">
          Wrapped <br/> <span className="text-[#1DB954]">2026</span>
        </h1>
        {user && <p className="text-[40px] text-gray-300">for {user.display_name}</p>}
      </div>

      <div className="z-10 flex flex-col space-y-16 mt-20">
        <div className="bg-white/10 p-12 rounded-[40px] border border-white/20 backdrop-blur-xl">
          <p className="text-[32px] text-gray-400 uppercase tracking-widest font-bold mb-4">Listening Personality</p>
          <p className="text-[80px] font-extrabold text-white leading-tight">{insights.personality}</p>
        </div>

        <div className="grid grid-cols-2 gap-12">
          <div className="bg-white/5 p-10 rounded-[32px]">
            <h3 className="text-[32px] text-[#1DB954] font-bold mb-6">Top Artists</h3>
            <div className="space-y-4 text-[40px] text-white font-medium">
              {insights.topArtists.slice(0, 5).map((a, i) => (
                <div key={i} className="flex"><span className="text-gray-500 w-12">{i + 1}.</span> {a.name}</div>
              ))}
            </div>
          </div>
          <div className="bg-white/5 p-10 rounded-[32px]">
            <h3 className="text-[32px] text-[#1DB954] font-bold mb-6">Top Tracks</h3>
            <div className="space-y-4 text-[40px] text-white font-medium">
              {insights.topTracks.slice(0, 5).map((t, i) => (
                <div key={i} className="flex truncate"><span className="text-gray-500 w-12">{i + 1}.</span> <span className="truncate">{t.name}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="z-10 mt-auto flex justify-between items-end border-t border-white/20 pt-12">
        <div>
          <p className="text-[32px] text-gray-400">Total Minutes</p>
          <p className="text-[64px] font-bold text-white">{insights.totalListeningMinutes.toLocaleString()}</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="w-[80px] h-[80px] bg-[#1DB954] rounded-full flex items-center justify-center text-black">
            {/* Spotify logo simplified */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-[48px] h-[48px]">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.54.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.84.241 1.2zM17.64 7.2c-3.96-2.34-10.44-2.58-14.28-1.44-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.44-1.26 11.52-.96 15.96 1.68.54.3.72 1.02.42 1.56-.24.54-.96.72-1.44.3z"/>
            </svg>
          </div>
          <p className="text-[32px] text-white font-bold tracking-wider">spotifywrapped.com</p>
        </div>
      </div>
    </div>
  );
}
