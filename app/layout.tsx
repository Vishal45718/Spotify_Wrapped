import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/providers/ToastProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Spotify Wrapped 2026',
  description: 'Your personalized, shareable Spotify Wrapped experience available year-round.',
  openGraph: {
    title: 'Spotify Wrapped 2026',
    description: 'Your personalized music analytics dashboard. Available 365 days a year.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#191414] text-[#FFFFFF] min-h-screen selection:bg-[#1DB954] selection:text-white`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
