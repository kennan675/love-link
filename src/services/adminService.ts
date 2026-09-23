import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://hxiycmrlyswwjqlwihdd.supabase.co";

const FALLBACK_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4aXljbXJseXN3d2pxbHdpaGRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk2MDY4MCwiZXhwIjoyMDg3NTM2NjgwfQ.ErV1TxNzvymk3Ckcn-iPPpe5AhyOy4_UpvLcVOKKTBA";

const SERVICE_KEY =
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || FALLBACK_SERVICE_ROLE_KEY;

// Privileged client used exclusively in admin portal to bypass RLS and perform actual database operations
export const adminSupabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export interface AdminProfile {
  id: string;
  user_id: string;
  full_name: string;
  occupation_title: string;
  occupation_company: string;
  dob: string | null;
  age: number | null;
  gender: string | null;
  intent: string | null;
  interests: string[] | null;
  bio: string | null;
  photos: string[] | null;
  avatar_url: string | null;
  verified: boolean;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
  deactivated_at: string | null;
  scheduled_deletion_at: string | null;
  leave_reason: string | null;
  leave_feedback: string | null;
  deletion_requested: boolean;
  is_public: boolean;
  is_admin: boolean;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  suspendedUsers: number;
  deletionRequestedUsers: number;
  maleUsers: number;
  femaleUsers: number;
  otherGender: number;
  intents: Record<string, number>;
}

export const adminService = {
  /**
   * Fetch all registered profiles with full admin metadata
   */
  async fetchProfiles(): Promise<AdminProfile[]> {
    const { data, error } = await (adminSupabase as any)
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch admin profiles:", error);
      throw error;
    }

    return (data || []) as AdminProfile[];
  },

  /**
   * Suspend a user account (deactivates and hides from all matching)
   */
  async suspendUser(userId: string, reason = "Suspended by administrator"): Promise<void> {
    const { data, error } = await (adminSupabase as any)
      .from("profiles")
      .update({
        is_public: false,
        deactivated_at: new Date().toISOString(),
        leave_reason: reason,
        deletion_requested: false,
      })
      .or(`id.eq.${userId},user_id.eq.${userId}`)
      .select();

    if (error) {
      console.error("Failed to suspend user:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error(`Profile ${userId} could not be updated.`);
    }
  },

  /**
   * Reactivate a suspended or deletion-pending user account
   */
  async reactivateUser(userId: string): Promise<void> {
    const { data, error } = await (adminSupabase as any)
      .from("profiles")
      .update({
        is_public: true,
        deactivated_at: null,
        scheduled_deletion_at: null,
        leave_reason: null,
        leave_feedback: null,
        deletion_requested: false,
      })
      .or(`id.eq.${userId},user_id.eq.${userId}`)
      .select();

    if (error) {
      console.error("Failed to reactivate user:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error(`Profile ${userId} could not be updated.`);
    }
  },

  /**
   * Toggle verification badge for a user
   */
  async toggleVerification(userId: string, verified: boolean): Promise<void> {
    const { data, error } = await (adminSupabase as any)
      .from("profiles")
      .update({ verified })
      .or(`id.eq.${userId},user_id.eq.${userId}`)
      .select();

    if (error) {
      console.error("Failed to toggle verification:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error(`Profile ${userId} could not be updated.`);
    }
  },

  /**
   * Completely and permanently delete a user and all related records
   */
  async deleteUser(userId: string): Promise<void> {
    const client = adminSupabase as any;

    // 1. Resolve target profile to obtain both profile.id and profile.user_id
    const { data: profile } = await client
      .from("profiles")
      .select("id, user_id, full_name")
      .or(`id.eq.${userId},user_id.eq.${userId}`)
      .maybeSingle();

    const targetUserId = profile?.user_id || userId;
    const targetProfileId = profile?.id || userId;

    // 2. Fetch matches involving this user (schema: user_a, user_b)
    try {
      const { data: matches } = await client
        .from("matches")
        .select("id")
        .or(`user_a.eq.${targetUserId},user_b.eq.${targetUserId}`);

      const matchIds = (matches || []).map((m: any) => m.id);

      // 3. Delete messages related to these matches or sent by targetUserId
      if (matchIds.length > 0) {
        await client.from("messages").delete().in("match_id", matchIds);
      }
      await client.from("messages").delete().eq("sender_id", targetUserId);

      // 4. Delete matches
      await client
        .from("matches")
        .delete()
        .or(`user_a.eq.${targetUserId},user_b.eq.${targetUserId}`);
    } catch (e) {
      console.warn("Could not clean up matches/messages:", e);
    }

    // 5. Delete swipes (schema: swiper_id, swiped_id)
    try {
      await client
        .from("swipes")
        .delete()
        .or(`swiper_id.eq.${targetUserId},swiped_id.eq.${targetUserId}`);
    } catch (e) {
      console.warn("Could not delete swipes:", e);
    }

    // 6. Delete profile row from database
    const { data: deletedProfiles, error: profileError } = await client
      .from("profiles")
      .delete()
      .or(`id.eq.${targetProfileId},user_id.eq.${targetUserId}`)
      .select();

    if (profileError) {
      console.error("Profile deletion error:", profileError);
      throw profileError;
    }

    // 7. Delete photos from storage bucket
    try {
      const { data: files } = await client.storage
        .from("profile-photos")
        .list(targetUserId);

      if (files && files.length > 0) {
        const filePaths = files.map((f: any) => `${targetUserId}/${f.name}`);
        await client.storage.from("profile-photos").remove(filePaths);
      }
    } catch (e) {
      console.warn("Could not remove storage files:", e);
    }

    // 8. Delete user from auth.users via admin API
    try {
      if (client.auth?.admin?.deleteUser) {
        await client.auth.admin.deleteUser(targetUserId);
      } else {
        await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${targetUserId}`, {
          method: "DELETE",
          headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
          },
        });
      }
    } catch (e) {
      console.warn("Could not delete auth user:", e);
    }
  },

  /**
   * Fetch aggregate admin statistics
   */
  async fetchStats(): Promise<AdminStats> {
    const profiles = await this.fetchProfiles();

    let verifiedUsers = 0;
    let suspendedUsers = 0;
    let deletionRequestedUsers = 0;
    let maleUsers = 0;
    let femaleUsers = 0;
    let otherGender = 0;
    const intents: Record<string, number> = {};

    profiles.forEach((p) => {
      if (p.verified) verifiedUsers++;
      if (p.deletion_requested) {
        deletionRequestedUsers++;
      } else if (p.deactivated_at) {
        suspendedUsers++;
      }

      const g = p.gender?.toLowerCase();
      if (g === "male") maleUsers++;
      else if (g === "female") femaleUsers++;
      else otherGender++;

      if (p.intent) {
        intents[p.intent] = (intents[p.intent] || 0) + 1;
      }
    });

    const activeUsers = profiles.filter(
      (p) => !p.deletion_requested && !p.deactivated_at && p.is_public
    ).length;

    return {
      totalUsers: profiles.length,
      activeUsers,
      verifiedUsers,
      suspendedUsers,
      deletionRequestedUsers,
      maleUsers,
      femaleUsers,
      otherGender,
      intents,
    };
  },
};
