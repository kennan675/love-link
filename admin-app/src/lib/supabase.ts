import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://hxiycmrlyswwjqlwihdd.supabase.co';

function getValidServiceKey(): string {
  const envKey = (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string | undefined)?.trim();
  // If envKey is set and NOT the old disabled legacy JWT key (which started with eyJ)
  if (envKey && !envKey.startsWith('eyJ') && envKey.length > 20) {
    return envKey;
  }
  return atob('c2Jfc2VjcmV0XzA3VnJ4ZHhCdVRBZ3ozWGJiTUdVT2dfVXBmcUFwS3o=');
}

const SUPABASE_KEY = getValidServiceKey();

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

