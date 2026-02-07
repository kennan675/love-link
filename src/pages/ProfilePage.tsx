import { Settings, Edit2, Shield, Star } from "lucide-react";
import TopNav from "@/components/TopNav";
import profile1 from "@/assets/profile-1.jpg";

const ProfilePage = () => {
  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      <TopNav />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-sm px-4 py-8">
          {/* Profile photo */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-primary shadow-glow">
                <img src={profile1} alt="Your profile" className="h-full w-full object-cover" />
              </div>
              <button className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full gradient-brand text-primary-foreground shadow-button">
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-foreground">You, 25</h2>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { label: "Likes", value: "42" },
              { label: "Matches", value: "12" },
              { label: "Super Likes", value: "3" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-card p-4 text-center">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-8 space-y-3">
            {[
              { icon: Settings, label: "Settings", desc: "Account, notifications" },
              { icon: Shield, label: "Safety", desc: "Block, report, privacy" },
              { icon: Star, label: "Get BlackLoveLink Gold", desc: "See who likes you & more", highlight: true },
            ].map(({ icon: Icon, label, desc, highlight }) => (
              <button
                key={label}
                className={`flex w-full items-center gap-4 rounded-xl p-4 text-left transition-colors ${
                  highlight
                    ? "gradient-gold text-background"
                    : "bg-card text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-5 w-5" />
                <div>
                  <p className="font-semibold">{label}</p>
                  <p className={`text-xs ${highlight ? "text-background/70" : "text-muted-foreground"}`}>{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
