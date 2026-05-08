import { Redis } from '@upstash/redis';

const url = process.env.KV_REST_API_URL || '';
const token = process.env.KV_REST_API_TOKEN || '';

// Use real Redis if properly configured, otherwise use a no-op mock
const isRealKV = url && token && !url.includes('mock');

export const kv = isRealKV
  ? new Redis({ url, token }) 
  : {
      get: async () => null,
      set: async () => 'OK',
      del: async () => 0,
    } as any;
