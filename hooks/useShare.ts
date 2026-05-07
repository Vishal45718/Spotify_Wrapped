import { useState } from 'react';
import { ProcessedInsights } from '@/types/insights';
import { TimeRange } from '@/types/spotify';

export function useShare() {
  const [isSharing, setIsSharing] = useState(false);

  const shareInsights = async (insights: ProcessedInsights, timeRange: TimeRange) => {
    setIsSharing(true);
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insights, timeRange }),
      });
      
      if (!res.ok) throw new Error('Failed to create share link');
      
      const { id } = await res.json();
      return id as string;
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      setIsSharing(false);
    }
  };

  return { shareInsights, isSharing };
}
