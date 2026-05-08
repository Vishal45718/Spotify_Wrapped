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
            // Try token refresh first
            const refreshRes = await fetch('/api/auth/refresh', { method: 'POST' });
            if (refreshRes.ok) {
              // Retry the insights fetch
              const retryRes = await fetch(`/api/insights?timeRange=${timeRange}`);
              if (retryRes.ok) {
                const json = await retryRes.json();
                if (mounted) setData(json);
                return;
              }
            }
            // Refresh failed — redirect to login
            window.location.href = '/login?error=session_expired';
            return;
          }
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to fetch insights');
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
