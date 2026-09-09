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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }
      setUserId(user.id);

      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      setIsAdmin(profile?.is_admin === true);
    };

    checkAdmin();
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_unlocked", "true");
      setIsUnlocked(true);
      
      // Auto-upgrade user to admin in DB if they aren't already
      if (!isAdmin && userId) {
        setIsUpdating(true);
        await (supabase as any).from('profiles').update({ is_admin: true }).eq('id', userId);
        setIsAdmin(true);
        setIsUpdating(false);
      }
    } else {
      setError(true);
      setPassword("");
    }
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!userId) {
    return <Navigate to="/auth" replace />;
  }
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <form onSubmit={handleUnlock} className="w-full max-w-sm bg-card border border-border p-8 rounded-3xl shadow-xl text-center">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-black mb-2">Admin Portal</h2>
          <p className="text-muted-foreground mb-8 text-sm">Please enter the master password to unlock the dashboard.</p>
          
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder="Password"
            className={`w-full px-4 py-3 rounded-xl bg-background border ${error ? 'border-destructive' : 'border-border'} text-foreground focus:outline-none focus:border-primary mb-4 transition-colors`}
          />
          {error && <p className="text-destructive text-sm font-bold mb-4">Incorrect password</p>}
          
          <button 
            type="submit" 
            disabled={isUpdating}
            className="w-full h-12 flex items-center justify-center rounded-xl gradient-brand text-primary-foreground font-bold shadow-button hover:opacity-90 transition-opacity disabled:opacity-50"
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
