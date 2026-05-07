import { SessionOptions } from 'iron-session';

export interface SessionData {
  userId?: string;
  spotifyId?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_dev_env',
  cookieName: 'spotify_wrapped_session',
  cookieOptions: {
    // secure only works in `https` environments
    // if your localhost is not on `https`, then use: `secure: process.env.NODE_ENV === "production"`
    secure: process.env.NODE_ENV === 'production',
  },
};
