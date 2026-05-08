'use client';

import { useState, useEffect } from 'react';
import { useInsights } from '@/hooks/useInsights';
import { m, AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GenreDonut } from '@/components/charts/GenreDonut';
import { MoodRadar } from '@/components/charts/MoodRadar';
import { PersonalityBadge } from '@/components/ui/PersonalityBadge';

export default function StoryPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const { data, loading, error } = useInsights('long_term');
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(false);

  const slides = [
    { type: 'intro', title: 'Ready for your 2026 journey?' },
    { type: 'top-artists', title: 'Your absolute favorites' },
    { type: 'top-tracks', title: 'The songs on repeat' },
    { type: 'genres', title: 'Your sound universe' },
    { type: 'aura', title: 'Your audio aura' },
    { type: 'personality', title: 'The final verdict' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentSlide < slides.length - 1 && !loading) {
        nextSlide();
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, [currentSlide, loading]);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide(prev => prev + 1);
    } else {
      router.push('/dashboard');
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(prev => prev - 1);
    }
  };

  if (loading) return (
    <div className="h-screen bg-[#191414] flex items-center justify-center">
      <m.div 
        animate={{ scale: [1, 1.2, 1] }} 
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="w-16 h-16 bg-[#1DB954] rounded-full"
      />
    </div>
  );

  if (error || !data) return (
    <div className="h-screen bg-[#191414] flex items-center justify-center p-8 text-center">
      <div>
        <p className="text-red-400 mb-4">{error || 'Failed to load story'}</p>
        <Link href="/dashboard" className="text-[#1DB954] underline">Back to Dashboard</Link>
      </div>
    </div>
  );

  return (
    <LazyMotion features={domAnimation}>
      <div className="h-screen bg-[#191414] text-white overflow-hidden relative flex items-center justify-center font-sans">
        {/* Progress Bar */}
        <div className="absolute top-4 left-0 right-0 z-50 flex gap-1 px-4">
          {slides.map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <m.div 
                initial={{ width: 0 }}
                animate={{ 
                  width: i < currentSlide ? '100%' : i === currentSlide ? '100%' : '0%' 
                }}
                transition={{ 
                  duration: i === currentSlide ? 6 : 0, 
                  ease: 'linear' 
                }}
                className="h-full bg-white"
              />
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="absolute top-8 right-4 z-50 flex gap-4">
          <button onClick={() => setIsMuted(!isMuted)} className="p-2 bg-black/20 rounded-full backdrop-blur-sm">
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button onClick={() => router.push('/dashboard')} className="p-2 bg-black/20 rounded-full backdrop-blur-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Overlays */}
        <div className="absolute inset-0 z-30 flex">
          <div className="flex-1 cursor-pointer" onClick={prevSlide} title="Previous" />
          <div className="flex-1 cursor-pointer" onClick={nextSlide} title="Next" />
        </div>

        <AnimatePresence initial={false} custom={direction}>
          <m.div
            key={currentSlide}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 300 : -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -300 : 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 flex items-center justify-center p-6 text-center"
          >
            {renderSlideContent(slides[currentSlide], data)}
          </m.div>
        </AnimatePresence>

        {/* Footer Nav */}
        <div className="absolute bottom-12 left-0 right-0 z-50 flex justify-center gap-12">
          <button onClick={prevSlide} disabled={currentSlide === 0} className="disabled:opacity-0 transition-opacity">
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button onClick={nextSlide}>
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      </div>
    </LazyMotion>
  );
}

function renderSlideContent(slide: any, data: any) {
  switch (slide.type) {
    case 'intro':
      return (
        <div className="space-y-6">
          <m.h2 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-black leading-tight bg-gradient-to-br from-[#1DB954] to-white bg-clip-text text-transparent"
          >
            Your year in music. <br />Decoded.
          </m.h2>
          <p className="text-xl text-gray-400">Spotify Wrapped 2026</p>
        </div>
      );
    case 'top-artists':
      return (
        <div className="w-full max-w-sm space-y-8">
          <h2 className="text-3xl font-bold mb-8">You couldn't stop listening to...</h2>
          <div className="space-y-4">
            {data.topArtists.slice(0, 3).map((artist: any, i: number) => (
              <m.div 
                key={artist.id}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.2 }}
                className="bg-white/10 p-4 rounded-2xl flex items-center gap-4"
              >
                <span className="text-2xl font-black text-[#1DB954] w-8">{i + 1}</span>
                <span className="text-xl font-bold">{artist.name}</span>
              </m.div>
            ))}
          </div>
        </div>
      );
    case 'top-tracks':
      return (
        <div className="w-full max-w-sm space-y-8">
          <h2 className="text-3xl font-bold">Your 2026 Soundtrack</h2>
          <div className="space-y-4">
            {data.topTracks.slice(0, 5).map((track: any, i: number) => (
              <m.div 
                key={track.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 text-left"
              >
                <img src={track.album.images[0]?.url} className="w-12 h-12 rounded-lg shadow-lg" alt="" />
                <div>
                  <p className="font-bold truncate w-48">{track.name}</p>
                  <p className="text-sm text-gray-400">{track.artists[0].name}</p>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      );
    case 'genres':
      return (
        <div className="w-full max-w-sm space-y-8">
          <h2 className="text-3xl font-bold">Your world was full of...</h2>
          <div className="h-64">
            <GenreDonut data={data.topGenres} />
          </div>
          <p className="text-[#1DB954] font-bold text-xl">{data.topGenres[0]?.genre}</p>
        </div>
      );
    case 'aura':
      return (
        <div className="w-full max-w-sm space-y-8">
          <h2 className="text-3xl font-bold">Your Audio Aura</h2>
          <div className="h-64">
            <MoodRadar scores={data.scores} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <p className="text-xs text-gray-400 uppercase tracking-widest">Mood</p>
              <p className="text-xl font-bold">{data.scores.mood}%</p>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <p className="text-xs text-gray-400 uppercase tracking-widest">Energy</p>
              <p className="text-xl font-bold">{data.scores.energy}%</p>
            </div>
          </div>
        </div>
      );
    case 'personality':
      return (
        <div className="space-y-8">
          <h2 className="text-3xl font-bold">You are a...</h2>
          <div className="scale-150 py-12">
            <PersonalityBadge personality={data.personality} />
          </div>
          <m.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/dashboard'}
            className="px-8 py-4 bg-[#1DB954] text-black font-bold rounded-full shadow-lg"
          >
            See Full Dashboard
          </m.button>
        </div>
      );
    default:
      return null;
  }
}
