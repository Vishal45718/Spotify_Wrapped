import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-[#191414] via-[#121212] to-[#181818] relative overflow-hidden">
      {/* Decorative blurred blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#1DB954] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#8A2BE2] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="z-10 text-center space-y-8 max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#1DB954] to-[#1ED760]">
          Spotify Wrapped 2026
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto">
          Your personalized, shareable music analytics dashboard. 
          Available 365 days a year, not just in December.
        </p>
        
        <div className="pt-8">
          <Link 
            href="/api/auth" 
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-black bg-[#1DB954] rounded-full hover:bg-[#1ed760] transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(29,185,84,0.4)]"
          >
            Connect with Spotify
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left opacity-80">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
            <h3 className="font-bold text-lg mb-2 text-[#1DB954]">Deep Insights</h3>
            <p className="text-sm text-gray-400">Discover your mood score, energy levels, and genre diversity index.</p>
          </div>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
            <h3 className="font-bold text-lg mb-2 text-[#1DB954]">Share Anywhere</h3>
            <p className="text-sm text-gray-400">Generate Instagram Story-ready cards with your unique listening personality.</p>
          </div>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
            <h3 className="font-bold text-lg mb-2 text-[#1DB954]">Always Live</h3>
            <p className="text-sm text-gray-400">Toggle between 4 weeks, 6 months, or all-time listening history instantly.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
