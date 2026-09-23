import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'BlackLoveAdmin2026!';

export default function LoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    if (password !== ADMIN_PASSWORD) {
      setError('Incorrect security key');
      setPassword('');
      return;
    }

    setLoading(true);
    sessionStorage.setItem('bll_admin_unlocked', 'true');
    navigate('/', { replace: true });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden font-display selection:bg-secondary/30 selection:text-secondary-foreground">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[130px]" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full bg-secondary/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative w-full max-w-sm"
      >
        <div className="bg-card border border-border rounded-3xl p-8 shadow-card text-center space-y-6">
          {/* Logo */}
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/15 border border-secondary/30 text-secondary shadow-glow mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-black text-foreground tracking-tight">
                Black<span className="text-primary">Love</span><span className="text-secondary">Link</span>
              </h1>
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold mt-1">
                Admin Console
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Master Security Key
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter security key"
                  autoComplete="current-password"
                  className="w-full bg-background border border-border text-foreground placeholder:text-muted-foreground/60 rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:border-secondary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-destructive text-xs font-bold text-center"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl gradient-brand text-white font-bold text-sm shadow-button hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Unlock Dashboard
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-muted-foreground/60">
            BlackLoveLink Admin · Restricted Access
          </p>
        </div>
      </motion.div>
    </div>
  );
}
