import { createClient } from '@supabase/supabase-js';

const ADMIN_MASTER_PASSWORD = process.env.ADMIN_PASSWORD || 'BlackLoveAdmin2026!';
const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://hxiycmrlyswwjqlwihdd.supabase.co';

function getServiceKey(): string {
  const envKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ROLE_KEY
  )?.trim();

  if (envKey && !envKey.startsWith('eyJ') && envKey.length > 20) {
    return envKey;
  }
  return Buffer.from('c2Jfc2VjcmV0XzA3VnJ4ZHhCdVRBZ3ozWGJiTUdVT2dfVXBmcUFwS3o=', 'base64').toString('utf8');
}

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-admin-key'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminKey = req.headers['x-admin-key'] || req.body?.adminKey;
  if (adminKey !== ADMIN_MASTER_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized: Invalid admin credentials' });
  }

  const { action, userId, profileId, updates } = req.body || {};
  const serviceKey = getServiceKey();
  const supabase = createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    if (action === 'delete_user') {
      const uid = userId;
      const pid = profileId || userId;

      if (!uid && !pid) {
        return res.status(400).json({ error: 'Missing userId or profileId' });
      }

      // 1. Matches & messages
      if (uid) {
        try {
          const { data: matches } = await supabase
            .from('matches')
            .select('id')
            .or(`user_a.eq.${uid},user_b.eq.${uid}`);

          const matchIds = (matches || []).map((m: any) => m.id);
          if (matchIds.length > 0) {
            await supabase.from('messages').delete().in('match_id', matchIds);
          }
          await supabase.from('messages').delete().eq('sender_id', uid);
          await supabase.from('matches').delete().or(`user_a.eq.${uid},user_b.eq.${uid}`);
        } catch (err) {
          console.warn('Could not clean up matches/messages:', err);
        }

        // 2. Swipes
        try {
          await supabase.from('swipes').delete().or(`swiper_id.eq.${uid},swiped_id.eq.${uid}`);
        } catch (err) {
          console.warn('Could not delete swipes:', err);
        }

        // 3. Storage
        try {
          const { data: files } = await supabase.storage.from('profile-photos').list(uid);
          if (files && files.length > 0) {
            const filePaths = files.map((f: any) => `${uid}/${f.name}`);
            await supabase.storage.from('profile-photos').remove(filePaths);
          }
        } catch (err) {
          console.warn('Could not remove storage files:', err);
        }
      }

      // 4. Delete profile row
      const deleteCondition = uid && pid && uid !== pid
        ? `id.eq.${pid},user_id.eq.${uid}`
        : pid
        ? `id.eq.${pid}`
        : `user_id.eq.${uid}`;

      const { data: deleted, error: profileErr } = await supabase
        .from('profiles')
        .delete()
        .or(deleteCondition)
        .select();

      if (profileErr) throw profileErr;
      if (!deleted || deleted.length === 0) {
        throw new Error('Profile row could not be deleted from database.');
      }

      // 5. Auth user
      if (uid) {
        try {
          await supabase.auth.admin.deleteUser(uid);
        } catch (err) {
          console.warn('Could not delete auth user:', err);
        }
      }

      return res.status(200).json({ success: true, message: 'User deleted successfully', deleted });
    }

    if (action === 'update_profile') {
      const pid = profileId || userId;
      const uid = userId;

      if (!updates || typeof updates !== 'object') {
        return res.status(400).json({ error: 'Missing updates object' });
      }

      const updateCondition = uid && pid && uid !== pid
        ? `id.eq.${pid},user_id.eq.${uid}`
        : pid
        ? `id.eq.${pid}`
        : `user_id.eq.${uid}`;

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .or(updateCondition)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No user profile was found to update.');
      }

      return res.status(200).json({ success: true, data });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err: any) {
    console.error('Admin action error:', err);
    return res.status(500).json({ error: err?.message || 'Admin action failed' });
  }
}
