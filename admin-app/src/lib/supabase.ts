import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://hxiycmrlyswwjqlwihdd.supabase.co';

const DEFAULT_SERVICE_KEY = atob('c2Jfc2VjcmV0XzA3VnJ4ZHhCdVRBZ3ozWGJiTUdVT2dfVXBmcUFwS3o=');

const SUPABASE_KEY =
  (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string | undefined) ||
  DEFAULT_SERVICE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

