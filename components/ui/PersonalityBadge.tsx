'use client';

import { Sparkles } from 'lucide-react';

interface Props {
  personality: string;
}

export function PersonalityBadge({ personality }: Props) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#1DB954]/20 to-transparent rounded-3xl border border-[#1DB954]/30 shadow-[0_0_30px_rgba(29,185,84,0.1)] backdrop-blur-md">
      <div className="bg-[#1DB954] text-black p-3 rounded-full mb-4 animate-bounce">
        <Sparkles className="w-8 h-8" />
      </div>
      <p className="text-sm text-gray-300 uppercase tracking-widest font-bold mb-1">Your Listening Personality</p>
      <h2 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 text-center">
        {personality}
      </h2>
    </div>
  );
}
