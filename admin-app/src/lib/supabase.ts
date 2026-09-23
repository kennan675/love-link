import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://hxiycmrlyswwjqlwihdd.supabase.co';

const FALLBACK_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4aXljbXJseXN3d2pxbHdpaGRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk2MDY4MCwiZXhwIjoyMDg3NTM2NjgwfQ.ErV1TxNzvymk3Ckcn-iPPpe5AhyOy4_UpvLcVOKKTBA';

const SUPABASE_KEY =
  (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || FALLBACK_SERVICE_ROLE_KEY) as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
