import { Redis } from '@upstash/redis';

const url = process.env.KV_REST_API_URL || '';
const token = process.env.KV_REST_API_TOKEN || '';

// Mock KV if not configured to prevent crashes during dev without KV
export const kv = (url && token) 
  ? new Redis({ url, token }) 
  : {
      get: async () => null,
      set: async () => 'OK',
    } as any;
