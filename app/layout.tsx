import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Spotify Wrapped 2026',
  description: 'Your personalized, shareable Spotify Wrapped experience available year-round.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#191414] text-[#FFFFFF] min-h-screen selection:bg-[#1DB954] selection:text-white`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
