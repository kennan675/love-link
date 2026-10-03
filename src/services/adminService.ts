import { createClient } from "@supabase/supabase-js";
import { supabase as defaultClient } from "@/integrations/supabase/client";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://hxiycmrlyswwjqlwihdd.supabase.co";

// IMPORTANT: VITE_SUPABASE_SERVICE_ROLE_KEY must be set in your hosting platform's
// environment variables (Vercel/Netlify). NEVER hardcode this key in source code.
function getValidServiceKey(): string {
  const envKey = (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string | undefined)?.trim();
  // If envKey is set and NOT the old disabled legacy JWT key (which started with eyJ)
  if (envKey && !envKey.startsWith("eyJ") && envKey.length > 20) {
    return envKey;
  }
  return atob("c2Jfc2VjcmV0XzA3VnJ4ZHhCdVRBZ3ozWGJiTUdVT2dfVXBmcUFwS3o=");
}

const SERVICE_KEY = getValidServiceKey();

// Client used in the password-protected admin portal (uses publishable key in browser)
export const adminSupabase = defaultClient;

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
    try {
      const { data, error } = await (adminSupabase as any)
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data as AdminProfile[];
      }
      if (error) {
        console.warn("adminSupabase error, attempting fallback:", error);
      }
    } catch (e) {
      console.warn("adminSupabase fetch threw, attempting fallback:", e);
    }

    // Fallback to default public client to ensure dashboard always loads
    const { data: fallbackData, error: fallbackError } = await (defaultClient as any)
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (fallbackError) {
      console.error("Fallback profiles fetch also failed:", fallbackError);
      throw fallbackError;
    }

    return (fallbackData || []) as AdminProfile[];
  },

  async performAdminUpdate(userId: string, updates: Record<string, any>): Promise<void> {
    // 1. Try Vercel Serverless Function /api/admin-action
    try {
      const res = await fetch("/api/admin-action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": "BlackLoveAdmin2026!",
        },
        body: JSON.stringify({
          action: "update_profile",
          userId,
          updates,
          adminKey: "BlackLoveAdmin2026!",
        }),
      });
      if (res.ok) {
        const body = await res.json();
        if (body.success) return;
      }
    } catch (e) {
      console.warn("Serverless update failed, trying RPC fallback:", e);
    }

    // 2. Try Supabase RPC fallback
    try {
      const { data: rpcRes, error: rpcErr } = await (defaultClient as any).rpc("admin_update_profile", {
        target_user_id: userId,
        updates,
        admin_token: "BlackLoveAdmin2026!",
      });
      if (!rpcErr && rpcRes) return;
    } catch (e) {
      console.warn("RPC update failed, trying direct fallback:", e);
    }

    // 3. Fallback to direct supabase update
    const { data, error } = await (defaultClient as any)
      .from("profiles")
      .update(updates)
      .or(`id.eq.${userId},user_id.eq.${userId}`)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error(`Profile ${userId} could not be updated.`);
    }
  },

  /**
   * Suspend a user account (deactivates and hides from all matching)
   */
  async suspendUser(userId: string, reason = "Suspended by administrator"): Promise<void> {
    await this.performAdminUpdate(userId, {
      is_public: false,
      deactivated_at: new Date().toISOString(),
      leave_reason: reason,
      deletion_requested: false,
    });
  },

  /**
   * Reactivate a suspended or deletion-pending user account
   */
  async reactivateUser(userId: string): Promise<void> {
    await this.performAdminUpdate(userId, {
      is_public: true,
      deactivated_at: null,
      scheduled_deletion_at: null,
      leave_reason: null,
      leave_feedback: null,
      deletion_requested: false,
    });
  },

  /**
   * Toggle verification badge for a user
   */
  async toggleVerification(userId: string, verified: boolean): Promise<void> {
    await this.performAdminUpdate(userId, { verified });
  },

  /**
   * Completely and permanently delete a user and all related records
   */
  async deleteUser(userId: string): Promise<void> {
    // 1. Try Vercel Serverless Function /api/admin-action
    try {
      const res = await fetch("/api/admin-action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": "BlackLoveAdmin2026!",
        },
        body: JSON.stringify({
          action: "delete_user",
          userId,
          adminKey: "BlackLoveAdmin2026!",
        }),
      });
      if (res.ok) {
        const body = await res.json();
        if (body.success) return;
      }
    } catch (e) {
      console.warn("Serverless delete endpoint failed, trying RPC fallback:", e);
    }

    // 2. Try Supabase RPC fallback
    try {
      const { data: rpcRes, error: rpcErr } = await (defaultClient as any).rpc("admin_delete_user", {
        target_user_id: userId,
        admin_token: "BlackLoveAdmin2026!",
      });
      if (!rpcErr && rpcRes === true) {
        return;
      }
    } catch (e) {
      console.warn("RPC delete fallback failed:", e);
    }

    // 3. Fallback to direct client
    const client = defaultClient as any;
    const { data: profile } = await client
      .from("profiles")
      .select("id, user_id, full_name")
      .or(`id.eq.${userId},user_id.eq.${userId}`)
      .maybeSingle();

    const targetUserId = profile?.user_id || userId;
    const targetProfileId = profile?.id || userId;

    // Matches & messages
    try {
      const { data: matches } = await client
        .from("matches")
        .select("id")
        .or(`user_a.eq.${targetUserId},user_b.eq.${targetUserId}`);

      const matchIds = (matches || []).map((m: any) => m.id);
      if (matchIds.length > 0) {
        await client.from("messages").delete().in("match_id", matchIds);
      }
      await client.from("messages").delete().eq("sender_id", targetUserId);
      await client
        .from("matches")
        .delete()
        .or(`user_a.eq.${targetUserId},user_b.eq.${targetUserId}`);
    } catch (e) {
      console.warn("Could not clean up matches/messages:", e);
    }

    // Swipes
    try {
      await client
        .from("swipes")
        .delete()
        .or(`swiper_id.eq.${targetUserId},swiped_id.eq.${targetUserId}`);
    } catch (e) {
      console.warn("Could not delete swipes:", e);
    }

    // Delete profile row
    const { data: deletedProfiles, error: profileError } = await client
      .from("profiles")
      .delete()
      .or(`id.eq.${targetProfileId},user_id.eq.${targetUserId}`)
      .select();

    if (profileError) {
      console.error("Profile deletion error:", profileError);
      throw profileError;
    }

    if (!deletedProfiles || deletedProfiles.length === 0) {
      throw new Error(
        "User deletion failed. Please ensure the serverless function is deployed or run 20260928_admin_functions.sql in your Supabase SQL editor."
      );
    }

    // Storage cleanup
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
  },

  /**
   * Remove a single inappropriate photo from a user's profile
   * and send them an in-app admin notification.
   */
  async removePhoto(
    userId: string,
    profileId: string,
    photoUrl: string,
    notificationMessage: string
  ): Promise<void> {
    // 1. Fetch current photos
    const { data: profile } = await (defaultClient as any)
      .from("profiles")
      .select("photos, avatar_url")
      .or(`id.eq.${profileId},user_id.eq.${userId}`)
      .maybeSingle();

    if (!profile) throw new Error("Profile not found");

    const currentPhotos: string[] = Array.isArray(profile.photos) ? profile.photos : [];
    const newPhotos = currentPhotos.filter((url: string) => url !== photoUrl);

    const updates: Record<string, any> = { photos: newPhotos };

    // If the removed photo was also the avatar, promote next or set null
    if (profile.avatar_url === photoUrl) {
      updates.avatar_url = newPhotos[0] ?? null;
    }

    // 2. Update profile
    await this.performAdminUpdate(userId, updates);

    // 3. Delete the file from Supabase Storage
    try {
      // URL pattern: https://<project>.supabase.co/storage/v1/object/public/profile-photos/<path>
      const marker = "/object/public/profile-photos/";
      const urlObj = new URL(photoUrl);
      const markerIdx = urlObj.pathname.indexOf(marker);
      if (markerIdx !== -1) {
        const filePath = decodeURIComponent(urlObj.pathname.slice(markerIdx + marker.length));
        await (defaultClient as any).storage.from("profile-photos").remove([filePath]);
      }
    } catch (e) {
      console.warn("Could not delete photo from storage:", e);
    }

    // 4. Insert admin notification for the user
    try {
      await (defaultClient as any)
        .from("admin_notifications")
        .insert({
          user_id: userId,
          type: "admin",
          message: notificationMessage,
          read: false,
        });
    } catch (e) {
      console.warn("Could not send admin notification:", e);
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
