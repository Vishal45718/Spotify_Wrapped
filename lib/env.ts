/** Validates that required env vars are set. Logs warnings at startup. */
export function validateEnv() {
  const required = ['SESSION_SECRET'];
  const spotify = ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET'];
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) missing.push(key);
  }

  const spotifyMissing = spotify.filter(k => !process.env[k] || process.env[k] === 'your_client_id_here' || process.env[k] === 'your_client_secret_here');

  if (missing.length > 0) {
    console.error(`\n❌ FATAL: Missing required env vars: ${missing.join(', ')}`);
    console.error('   Copy .env.example to .env.local and fill in values.\n');
  }

  if (spotifyMissing.length > 0) {
    console.warn(`\n⚠️  Spotify credentials not configured: ${spotifyMissing.join(', ')}`);
    console.warn('   App will run in Demo Mode. Real Spotify login requires valid credentials.');
    console.warn('   See: https://developer.spotify.com/dashboard\n');
  }

  return {
    isConfigured: spotifyMissing.length === 0,
    isDemoOnly: spotifyMissing.length > 0,
  };
}

/** Check if Spotify credentials are real (not placeholder) */
export function isSpotifyConfigured(): boolean {
  const clientId = process.env.SPOTIFY_CLIENT_ID || '';
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
  return (
    clientId.length > 0 &&
    clientId !== 'your_client_id_here' &&
    clientSecret.length > 0 &&
    clientSecret !== 'your_client_secret_here'
  );
}

export function getRedirectUri(): string {
  return process.env.SPOTIFY_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback`;
}
