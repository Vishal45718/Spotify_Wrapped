import { SpotifyArtist, SpotifyTrack } from './spotify';

export interface Scores {
  mood: number;
  energy: number;
  discovery: number;
  diversity: number;
}

export interface ProcessedInsights {
  topArtists: SpotifyArtist[];
  topTracks: SpotifyTrack[];
  topGenres: { genre: string; count: number }[];
  scores: Scores;
  personality: string;
  listeningHours: { hour: number; count: number }[];
  totalListeningMinutes: number;
}
