import { supabase } from "@/integrations/supabase/client";

export async function getProfileStatus(userId: string): Promise<"complete" | "incomplete"> {
  if (!userId) return "incomplete";

  const cacheKey = `bll_profile_completed_${userId}`;
  if (typeof window !== "undefined" && localStorage.getItem(cacheKey) === "true") {
    return "complete";
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("profile_completed")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data?.profile_completed) {
      if (typeof window !== "undefined") {
        localStorage.setItem(cacheKey, "true");
      }
      return "complete";
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
