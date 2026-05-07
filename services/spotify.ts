import {
  SpotifyArtist,
  SpotifyAudioFeatures,
  SpotifyRecentlyPlayed,
  SpotifyTrack,
  SpotifyUser,
  TimeRange,
} from '@/types/spotify';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class SpotifyAPIError extends Error {
  constructor(public status: number, message?: string) {
    super(message || `Spotify API Error: ${status}`);
  }
}

export class SpotifyService {
  constructor(private accessToken: string) {}

  private async fetch<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`https://api.spotify.com/v1${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${this.accessToken}` },
      next: { revalidate: 0 },
    });

    if (res.status === 401) {
      throw new SpotifyAPIError(401, 'Unauthorized');
    }
    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After') ?? '1';
      await sleep(parseInt(retryAfter, 10) * 1000);
      return this.fetch<T>(path, params); // retry once
    }
    if (!res.ok) {
      const text = await res.text();
      console.error('Spotify API Error Response:', text);
      throw new SpotifyAPIError(res.status);
    }
    return res.json();
  }

  async getMe(): Promise<SpotifyUser> {
    return this.fetch<SpotifyUser>('/me');
  }

  async getTopArtists(time_range: TimeRange = 'long_term'): Promise<SpotifyArtist[]> {
    const res = await this.fetch<{ items: SpotifyArtist[] }>('/me/top/artists', {
      limit: '50',
      time_range,
    });
    return res.items;
  }

  async getTopTracks(time_range: TimeRange = 'long_term'): Promise<SpotifyTrack[]> {
    const res = await this.fetch<{ items: SpotifyTrack[] }>('/me/top/tracks', {
      limit: '50',
      time_range,
    });
    return res.items;
  }

  async getAudioFeatures(ids: string[]): Promise<SpotifyAudioFeatures[]> {
    if (ids.length === 0) return [];
    // Max 100 per request, we usually have up to 50
    const res = await this.fetch<{ audio_features: SpotifyAudioFeatures[] }>('/audio-features', {
      ids: ids.slice(0, 100).join(','),
    });
    return res.audio_features.filter(Boolean);
  }

  async getRecentlyPlayed(): Promise<SpotifyRecentlyPlayed[]> {
    const res = await this.fetch<{ items: SpotifyRecentlyPlayed[] }>('/me/player/recently-played', {
      limit: '50',
    });
    return res.items;
  }
}
