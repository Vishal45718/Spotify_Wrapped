import { ShareCard } from '@/components/ui/ShareCard';
import { ProcessedInsights } from '@/types/insights';
import Link from 'next/link';

async function getShareData(id: string) {
  // Use absolute URL for server fetch since this is SSR
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/share?id=${id}`, {
    cache: 'no-store'
  });
  if (!res.ok) return null;
  return res.json() as Promise<ProcessedInsights>;
}

export default async function SharePage({ params }: { params: { id: string } }) {
  const data = await getShareData(params.id);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h1 className="text-2xl text-gray-400">Card not found</h1>
        <Link href="/" className="px-6 py-2 bg-[#1DB954] text-black rounded-full font-bold">
          Make Your Own
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center py-12 px-4 space-y-12 bg-gradient-to-br from-[#191414] to-[#121212]">
      <div className="relative border-4 border-[#1DB954]/20 rounded-[2rem] overflow-hidden shadow-2xl" style={{ width: 1080 * 0.35, height: 1920 * 0.35 }}>
        <div className="absolute top-0 left-0 origin-top-left" style={{ transform: 'scale(0.35)' }}>
          <ShareCard insights={data} />
        </div>
      </div>
      
      <Link 
        href="/" 
        className="px-8 py-4 bg-[#1DB954] text-black rounded-full font-bold text-lg shadow-[0_0_20px_rgba(29,185,84,0.3)] hover:scale-105 transition-transform"
      >
        Create Your Own Wrapped 2026
      </Link>
    </main>
  );
}
