import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://hxiycmrlyswwjqlwihdd.supabase.co';

// IMPORTANT: VITE_SUPABASE_SERVICE_ROLE_KEY must be set in your hosting platform's
// environment variables (Vercel/Netlify). NEVER hardcode this key in source code.
const SUPABASE_KEY =
  (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  'sb_publishable_JFUMyQCrC-vLFej5fatodw_P2OyltEZ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

