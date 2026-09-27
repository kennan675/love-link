import { supabase } from "@/integrations/supabase/client";

export async function getProfileStatus(userId: string): Promise<"complete" | "incomplete"> {
  if (!userId) return "incomplete";

  const cacheKey = `bll_profile_completed_${userId}`;
  if (typeof window !== "undefined" && localStorage.getItem(cacheKey) === "true") {
    return "complete";
  }

  try {
    // 1. Check profiles table by user_id
    let { data, error } = await supabase
      .from("profiles")
      .select("id, user_id, full_name, gender, dob, age, photos, avatar_url, profile_completed")
      .eq("user_id", userId)
      .maybeSingle();

    // 2. Fallback check by id (for profiles created where id = auth.uid())
    if (!data && !error) {
      const fallback = await supabase
        .from("profiles")
        .select("id, user_id, full_name, gender, dob, age, photos, avatar_url, profile_completed")
        .eq("id", userId)
        .maybeSingle();
      data = fallback.data;
      error = fallback.error;
    }

    if (!error && data) {
      const hasCompletedFlag = Boolean(data.profile_completed);
      const hasName = typeof data.full_name === "string" && data.full_name.trim().length > 0;
      const hasDetails = Boolean(
        data.gender ||
        data.dob ||
        data.age ||
        (Array.isArray(data.photos) && data.photos.length > 0) ||
        data.avatar_url
      );

      // Existing profile found!
      if (hasCompletedFlag || (hasName && hasDetails) || (data.id && hasDetails)) {
        if (typeof window !== "undefined") {
          localStorage.setItem(cacheKey, "true");
        }
        // Self-heal: ensure profile_completed is true in database
        if (!hasCompletedFlag) {
          const profileId = data.id || userId;
          supabase
            .from("profiles")
            .update({ profile_completed: true })
            .or(`user_id.eq.${userId},id.eq.${profileId}`)
            .then(() => {})
            .catch(() => {});
        }
        return "complete";
      }
    }

    return "incomplete";
  } catch (err) {
    console.warn("Could not check profile status:", err);
    return "incomplete";
  }
}

export function markProfileComplete(userId: string) {
  if (!userId || typeof window === "undefined") return;
  localStorage.setItem(`bll_profile_completed_${userId}`, "true");
}
