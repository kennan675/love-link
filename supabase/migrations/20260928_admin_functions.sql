-- 20260928_admin_functions.sql
-- Run this script in your Supabase SQL Editor if you wish to enable direct database RPC support for admin operations.

-- 1. Secure function for admin to delete any user (with all related data)
CREATE OR REPLACE FUNCTION public.admin_delete_user(
  target_user_id UUID,
  admin_token TEXT DEFAULT ''
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Verify master admin password
  IF admin_token <> 'BlackLoveAdmin2026!' THEN
    RAISE EXCEPTION 'Unauthorized: Invalid admin credentials';
  END IF;

  -- 1. Delete messages
  DELETE FROM public.messages WHERE sender_id = target_user_id;

  -- 2. Delete matches
  DELETE FROM public.matches WHERE user_a = target_user_id OR user_b = target_user_id;

  -- 3. Delete swipes
  DELETE FROM public.swipes WHERE swiper_id = target_user_id OR swiped_id = target_user_id;

  -- 4. Delete profile
  DELETE FROM public.profiles WHERE user_id = target_user_id OR id = target_user_id;

  -- 5. Delete auth user
  DELETE FROM auth.users WHERE id = target_user_id;

  RETURN true;
END;
$$;

-- Allow execution from client
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID, TEXT) TO anon, authenticated, service_role;

-- 2. Secure function for admin to update any profile (suspend, reactivate, verify)
CREATE OR REPLACE FUNCTION public.admin_update_profile(
  target_user_id UUID,
  updates JSONB,
  admin_token TEXT DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  updated_row RECORD;
BEGIN
  -- Verify master admin password
  IF admin_token <> 'BlackLoveAdmin2026!' THEN
    RAISE EXCEPTION 'Unauthorized: Invalid admin credentials';
  END IF;

  UPDATE public.profiles
  SET
    is_public = COALESCE((updates->>'is_public')::boolean, is_public),
    deactivated_at = CASE 
      WHEN updates ? 'deactivated_at' THEN (updates->>'deactivated_at')::timestamptz 
      ELSE deactivated_at 
    END,
    scheduled_deletion_at = CASE 
      WHEN updates ? 'scheduled_deletion_at' THEN (updates->>'scheduled_deletion_at')::timestamptz 
      ELSE scheduled_deletion_at 
    END,
    leave_reason = CASE 
      WHEN updates ? 'leave_reason' THEN updates->>'leave_reason' 
      ELSE leave_reason 
    END,
    leave_feedback = CASE 
      WHEN updates ? 'leave_feedback' THEN updates->>'leave_feedback' 
      ELSE leave_feedback 
    END,
    deletion_requested = COALESCE((updates->>'deletion_requested')::boolean, deletion_requested),
    verified = COALESCE((updates->>'verified')::boolean, verified)
  WHERE user_id = target_user_id OR id = target_user_id
  RETURNING * INTO updated_row;

  RETURN to_jsonb(updated_row);
END;
$$;

-- Allow execution from client
GRANT EXECUTE ON FUNCTION public.admin_update_profile(UUID, JSONB, TEXT) TO anon, authenticated, service_role;
