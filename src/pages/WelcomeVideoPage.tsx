import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, SkipForward } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const WelcomeVideoPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    void videoRef.current?.play().catch(() => undefined);
  }, []);

  const continueToApp = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) localStorage.setItem(`bll_welcome_video_seen_${user.id}`, "true");
    navigate("/permissions", { replace: true });
  };

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-secondary/10" />
      <section className="relative z-10 w-full max-w-4xl text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full gradient-brand shadow-glow">
          <Heart className="h-6 w-6 text-primary-foreground" fill="currentColor" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-secondary">Welcome to BlackLoveLink</p>
        <h1 className="mt-2 text-3xl font-black text-foreground sm:text-4xl">Your next chapter starts here.</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Take a moment to see what intentional connection can look like.</p>
        <video
          ref={videoRef}
          className="mt-7 max-h-[62vh] w-full rounded-2xl border border-border/70 bg-black shadow-2xl"
          src="/blacklovelink-welcome.mp4"
          controls
          playsInline
          preload="metadata"
          onEnded={() => void continueToApp()}
          aria-label="Welcome to BlackLoveLink"
        />
        <button onClick={() => void continueToApp()} className="mt-6 inline-flex items-center gap-2 rounded-full gradient-brand px-7 py-3.5 font-bold text-primary-foreground shadow-button transition hover:scale-[1.02]">
          Skip and continue <SkipForward className="h-4 w-4" /> <ArrowRight className="h-4 w-4" />
        </button>
      </section>
    </main>
  );
};

export default WelcomeVideoPage;
