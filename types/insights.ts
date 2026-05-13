import { SpotifyArtist, SpotifyTrack } from './spotify';

export interface Scores {
  mood: number;
  energy: number;
  discovery: number;
  diversity: number;
}

export interface GenreLocation {
  genre: string;
  country: string;
  city?: string;
  lat: number;
  lng: number;
  region: string;
  color?: string;
  /** Listening weight used for heat intensity (1 = strongest in set) */
  intensity?: number;
  /** Aggregated play weight from merged genre buckets */
  count?: number;
  /** Great-circle distance from the listener hub (miles) */
  milesFromUser?: number;
  /** ISO 3166-1 alpha-2 for passport / map logic */
  isoA2?: string;
  /** `properties.name` from Natural Earth (world-atlas) for choropleth fill */
  geoName?: string;
}

export interface UserMapOrigin {
  lat: number;
  lng: number;
  country: string;
  countryCode: string;
  city?: string;
}

export interface InsightsLocationData {
  totalMiles: number;
  countriesVisited: number;
  hotspots: GenreLocation[];
  userOrigin: UserMapOrigin;
  favoriteInternationalGenre: string | null;
  mostDistantGenre: string | null;
  mostDistantMiles: number;
}

export interface ProcessedInsights {
  topArtists: SpotifyArtist[];
  topTracks: SpotifyTrack[];
  topGenres: { genre: string; count: number }[];
  scores: Scores;
  personality: string;
  listeningHours: { hour: number; count: number }[];
  totalListeningMinutes: number;
  /** Present for new API responses; older shared cards may omit this field. */
  locationData?: InsightsLocationData;
}
