export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  country: string;
  images: { url: string; height: number; width: number }[];
}

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  images: SpotifyImage[];
  popularity: number;
  external_urls: { spotify: string };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
  artists: SpotifyArtist[];
  album: {
    id: string;
    name: string;
    release_date: string;
    images: SpotifyImage[];
  };
  external_urls: { spotify: string };
}

export interface SpotifyAudioFeatures {
  id: string;
  danceability: number;
  energy: number;
  valence: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  speechiness: number;
  tempo: number;
}

export interface SpotifyRecentlyPlayed {
  track: SpotifyTrack;
  played_at: string;
}

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';
