'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { m, LazyMotion, domAnimation } from 'framer-motion';
import { Music, Headphones, BarChart3, Share2, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import Link from 'next/link';

const ERROR_MESSAGES: Record<string, string> = {
  invalid_state: 'Authentication failed. Please try again.',
  token_exchange_failed: 'Could not connect to Spotify. Please try again.',
  access_denied: 'You cancelled the Spotify login.',
  session_expired: 'Your session expired. Please log in again.',
};

const FEATURES = [
  { icon: BarChart3, title: 'Deep Insights', desc: 'Mood score, energy levels, genre diversity index' },
  { icon: Share2, title: 'Share Anywhere', desc: 'Instagram Story-ready cards with your personality' },
  { icon: Headphones, title: 'Always Live', desc: '4 weeks, 6 months, or all-time — anytime' },
];

export default function LoginPage() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('error');
  const [isLoading, setIsLoading] = useState(false);
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    if (errorCode) {
      setShowRetry(true);
      const timer = setTimeout(() => setShowRetry(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [errorCode]);

  const handleLogin = () => {
    setIsLoading(true);
    window.location.href = '/api/auth/login';
  };

  const handleDemo = () => {
    setIsLoading(true);
    window.location.href = '/api/auth/login';
  };

  return (
    <LazyMotion features={domAnimation}>
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#191414] via-[#121212] to-[#181818] relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <m.div
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -40, 20, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-[#1DB954] rounded-full mix-blend-screen filter blur-[150px] opacity-15"
          />
          <m.div
            animate={{
              x: [0, -30, 20, 0],
              y: [0, 30, -20, 0],
              scale: [1, 0.95, 1.1, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-[#8A2BE2] rounded-full mix-blend-screen filter blur-[150px] opacity-15"
          />
          <m.div
            animate={{
              x: [0, 15, -15, 0],
              y: [0, -20, 10, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute top-[40%] left-[50%] w-[300px] h-[300px] bg-[#1DB954] rounded-full mix-blend-screen filter blur-[120px] opacity-10"
          />
        </div>

        <div className="z-10 text-center max-w-lg w-full space-y-8">
          {/* Logo + Title */}
          <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <m.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  className="w-20 h-20 border-2 border-[#1DB954]/30 rounded-full absolute inset-0"
                />
                <div className="w-20 h-20 bg-gradient-to-br from-[#1DB954] to-[#1ED760] rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(29,185,84,0.3)]">
                  <Music className="w-10 h-10 text-black" />
                </div>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1DB954] to-[#1ED760]">
                Spotify Wrapped
              </span>
              <br />
              <span className="text-white">2026</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
              Your personalized music analytics dashboard.
              <br />
              Available 365 days a year.
            </p>
          </m.div>

          {/* Error banner */}
          {errorCode && (
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-left"
            >
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <p className="text-red-300 text-sm font-medium">
                  {ERROR_MESSAGES[errorCode] || 'An error occurred. Please try again.'}
                </p>
                {showRetry && (
                  <button
                    onClick={handleLogin}
                    className="text-red-400 text-xs underline mt-1 hover:text-red-300"
                  >
                    Try again
                  </button>
                )}
              </div>
            </m.div>
          )}

          {/* Login Buttons */}
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-4 pt-4"
          >
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-black bg-[#1DB954] rounded-full hover:bg-[#1ED760] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_rgba(29,185,84,0.3)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.54.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.84.241 1.2zM17.64 7.2c-3.96-2.34-10.44-2.58-14.28-1.44-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.44-1.26 11.52-.96 15.96 1.68.54.3.72 1.02.42 1.56-.24.54-.96.72-1.44.3z"/>
                </svg>
              )}
              {isLoading ? 'Connecting...' : 'Continue with Spotify'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-[#191414] text-gray-500 uppercase tracking-wider">or</span>
              </div>
            </div>

            <button
              onClick={handleDemo}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-8 py-3 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              Continue as Demo User
            </button>
          </m.div>

          {/* Features */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8"
          >
            {FEATURES.map((f, i) => (
              <m.div
                key={f.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="bg-white/[0.03] p-5 rounded-2xl border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.06] transition-colors group"
              >
                <f.icon className="w-6 h-6 text-[#1DB954] mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-sm mb-1 text-white">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </m.div>
            ))}
          </m.div>

          {/* Footer */}
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xs text-gray-600 pt-4"
          >
            We only request read access to your listening history.
            <br />
            No playlists are modified. Ever.
          </m.p>
        </div>
      </main>
    </LazyMotion>
  );
}
