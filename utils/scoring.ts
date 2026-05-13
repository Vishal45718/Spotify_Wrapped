import {
  SpotifyArtist,
  SpotifyAudioFeatures,
  SpotifyRecentlyPlayed,
  SpotifyTrack,
} from '@/types/spotify';
import { ProcessedInsights, Scores } from '@/types/insights';
import { getGenreTravelData } from '@/utils/genreLocations';

export function processInsights({
  artists,
  tracks,
  recent,
  audioFeatures,
  userCountryCode,
}: {
  artists: SpotifyArtist[];
  tracks: SpotifyTrack[];
  recent: SpotifyRecentlyPlayed[];
  audioFeatures: SpotifyAudioFeatures[];
  /** Spotify profile country (ISO 3166-1 alpha-2) for genre travel arcs */
  userCountryCode?: string;
}): ProcessedInsights {
  // Top genres: flatten artist.genres[], count frequency
  const genreCounts = artists
    .flatMap(a => a.genres)
    .reduce((acc, g) => {
      acc[g] = (acc[g] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topGenres = Object.entries(genreCounts)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const locationData = getGenreTravelData(topGenres, userCountryCode);

  const avg = (arr: number[]) => (arr.length ? arr.reduce((sum, n) => sum + n, 0) / arr.length : 0);

  // Mood score (0–100): avg valence × 100
  const moodScore = avg(audioFeatures.map(f => f?.valence || 0)) * 100;

  // Energy score: avg energy × 100
  const energyScore = avg(audioFeatures.map(f => f?.energy || 0)) * 100;

  // Artist diversity index: # unique genres / total genres
  const uniqueGenres = new Set(artists.flatMap(a => a.genres)).size;
  const diversityScore = Math.min(uniqueGenres / 30, 1) * 100; // normalize to 30 genres = 100

  // Discovery score: % of top tracks released in last 12 months
  const discoveryScore =
    (tracks.filter(t => {
      if (!t.album?.release_date) return false;
      const age = Date.now() - new Date(t.album.release_date).getTime();
      return age < 365 * 24 * 60 * 60 * 1000;
    }).length /
      Math.max(tracks.length, 1)) *
    100;

  const scores: Scores = {
    mood: moodScore,
    energy: energyScore,
    discovery: discoveryScore,
    diversity: diversityScore,
  };

  const personality = getPersonality(scores);

  // Listening hours (0-23 array)
  const hourCounts = new Array(24).fill(0);
  recent.forEach(r => {
    const hour = new Date(r.played_at).getHours();
    hourCounts[hour]++;
  });
  const listeningHours = hourCounts.map((count, hour) => ({ hour, count }));

  // Total listening minutes for top tracks
  const totalListeningMinutes = Math.floor(
    tracks.reduce((acc, t) => acc + (t.duration_ms || 0), 0) / 60000
  );

  return {
    topArtists: artists,
    topTracks: tracks,
    topGenres,
    scores,
    personality,
    listeningHours,
    totalListeningMinutes,
    locationData,
  } satisfies ProcessedInsights;
}

function getPersonality(scores: Scores): string {
  if (scores.discovery > 70) return 'Trendsetter';
  if (scores.diversity > 70) return 'Genre Tourist';
  if (scores.mood > 75 && scores.energy > 70) return 'Euphoric Listener';
  if (scores.mood < 35) return 'Dark Romantic';
  if (scores.energy < 30) return 'Ambient Dreamer';
  return 'Balanced Explorer';
}
