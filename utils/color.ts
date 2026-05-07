export const GENRE_COLORS = [
  '#1DB954', // Spotify Green
  '#8A2BE2', // Blue Violet
  '#FF4500', // Orange Red
  '#1E90FF', // Dodger Blue
  '#FFD700', // Gold
  '#FF1493', // Deep Pink
  '#00CED1', // Dark Turquoise
];

export function getGenreColor(index: number): string {
  return GENRE_COLORS[index % GENRE_COLORS.length];
}
