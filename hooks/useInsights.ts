import { useState, useEffect } from 'react';
import { ProcessedInsights } from '@/types/insights';
import { TimeRange } from '@/types/spotify';

export function useInsights(timeRange: TimeRange) {
  const [data, setData] = useState<ProcessedInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    async function fetchInsights() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/insights?timeRange=${timeRange}`);
        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = '/';
            return;
          }
          throw new Error('Failed to fetch insights');
        }
        const json = await res.json();
        if (mounted) {
          setData(json);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchInsights();
    
    return () => { mounted = false; };
  }, [timeRange]);

  return { data, loading, error };
}
