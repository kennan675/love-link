import { createClient } from "@supabase/supabase-js";
import { supabase as defaultClient } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Privileged client used exclusively in admin portal when unlocked
export const adminSupabase = SERVICE_KEY
  ? createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  : defaultClient;

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
    const { error } = await (adminSupabase as any)
      .from("profiles")
      .update({
        is_public: false,
        deactivated_at: new Date().toISOString(),
        leave_reason: reason,
        deletion_requested: false,
      })
      .eq("user_id", userId);

    if (error) throw error;
  },

  /**
   * Reactivate a suspended or deletion-pending user account
   */
  async reactivateUser(userId: string): Promise<void> {
    const { error } = await (adminSupabase as any)
      .from("profiles")
      .update({
        is_public: true,
        deactivated_at: null,
        scheduled_deletion_at: null,
        leave_reason: null,
        leave_feedback: null,
        deletion_requested: false,
      })
      .eq("user_id", userId);

    if (error) throw error;
  },

  /**
   * Toggle verification badge for a user
   */
  async toggleVerification(userId: string, verified: boolean): Promise<void> {
    const { error } = await (adminSupabase as any)
      .from("profiles")
      .update({ verified })
      .eq("user_id", userId);

    if (error) throw error;
  },

  /**
   * Completely and permanently delete a user and all related records
   */
  async deleteUser(userId: string): Promise<void> {
    const client = adminSupabase as any;

    // 1. Delete swipes
    try {
      await client.from("swipes").delete().eq("swiper_id", userId);
      await client.from("swipes").delete().eq("swiped_id", userId);
    } catch (e) {
      console.warn("Could not delete swipes:", e);
    }

    // 2. Delete messages
    try {
      await client.from("messages").delete().eq("sender_id", userId);
    } catch (e) {
      console.warn("Could not delete messages:", e);
    }

    // 3. Delete matches
    try {
      await client.from("matches").delete().eq("user1_id", userId);
      await client.from("matches").delete().eq("user2_id", userId);
    } catch (e) {
      console.warn("Could not delete matches:", e);
    }

    // 4. Delete profile row
    const { error: profileError } = await client
      .from("profiles")
      .delete()
      .eq("user_id", userId);

    if (profileError) throw profileError;

    // 5. Delete photos from storage if available
    try {
      const { data: files } = await client.storage
        .from("profile-photos")
        .list(userId);

      if (files && files.length > 0) {
        const filePaths = files.map((f: any) => `${userId}/${f.name}`);
        await client.storage.from("profile-photos").remove(filePaths);
      }
    } catch (e) {
      console.warn("Could not remove storage files:", e);
    }

    // 6. Delete user from auth.users via admin API
    try {
      if (SERVICE_KEY) {
        await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
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
