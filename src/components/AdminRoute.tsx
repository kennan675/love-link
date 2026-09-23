import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Lock } from "lucide-react";

const AdminRoute = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(
    sessionStorage.getItem("admin_unlocked") === "true"
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // You can change this password or move it to a .env variable later
  const ADMIN_PASSWORD = "BlackLoveAdmin2026!";

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const { data: profile } = await (supabase as any)
            .from('profiles')
            .select('is_admin')
            .or(`id.eq.${user.id},user_id.eq.${user.id}`)
            .maybeSingle();
          setIsAdmin(profile?.is_admin === true);
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_unlocked", "true");
      setIsUnlocked(true);
      
      // Auto-upgrade user to admin in DB if they are authenticated
      if (userId) {
        setIsUpdating(true);
        try {
          await (supabase as any)
            .from('profiles')
            .update({ is_admin: true })
            .or(`id.eq.${userId},user_id.eq.${userId}`);
          setIsAdmin(true);
        } catch (err) {
          console.warn("Could not set is_admin on profile:", err);
        } finally {
          setIsUpdating(false);
        }
      }
    } else {
      setError(true);
      setPassword("");
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 selection:bg-secondary/30">
        <form onSubmit={handleUnlock} className="w-full max-w-sm bg-card border border-border p-8 rounded-3xl shadow-card text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-secondary/15 rounded-2xl flex items-center justify-center text-secondary border border-secondary/30 shadow-glow">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-black text-foreground">Admin Console</h2>
            <p className="text-muted-foreground text-xs mt-1">Enter your master security key to unlock.</p>
          </div>
          
          <div className="pt-2">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Master Security Key"
              className={`w-full px-4 py-3 rounded-xl bg-background border ${error ? 'border-destructive' : 'border-border'} text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-secondary transition-colors text-sm`}
            />
            {error && <p className="text-destructive text-xs font-bold mt-2">Incorrect master key</p>}
          </div>
          
          <button 
            type="submit" 
            disabled={isUpdating}
            className="w-full h-12 flex items-center justify-center rounded-xl gradient-brand text-white font-bold text-sm shadow-button hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isUpdating ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : "Unlock Dashboard"}
          </button>
        </form>
      </div>
    );
  }

  // If unlocked via master password, grant access immediately.
  // The password itself is the auth gate — no need to also check isAdmin here,
  // which caused a race condition that redirected to "/" right after login.
  return <Outlet />;
};

export default AdminRoute;
