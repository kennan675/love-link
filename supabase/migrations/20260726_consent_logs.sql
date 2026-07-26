-- Create consent_logs table
CREATE TABLE IF NOT EXISTS public.consent_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    setting_key TEXT NOT NULL,
    value BOOLEAN NOT NULL,
    policy_version TEXT DEFAULT '1.0',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT,
    source TEXT DEFAULT 'web'
);

-- Enable RLS
ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own consent logs
CREATE POLICY "Users can insert their own consent logs" 
ON public.consent_logs 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own consent logs
CREATE POLICY "Users can view their own consent logs" 
ON public.consent_logs 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);
