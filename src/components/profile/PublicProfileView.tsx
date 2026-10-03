import { motion } from "framer-motion";
import { ChevronLeft, CheckCircle2, Briefcase, MapPin, Heart, MessageCircle, User } from "lucide-react";
import type { UserProfile } from "@/hooks/useProfileData";

interface PublicProfileViewProps {
  profile: UserProfile | null;
  onClose: () => void;
  actionButtons?: React.ReactNode;
  messageRequestText?: string | null;
}

export default function PublicProfileView({ profile, onClose, actionButtons, messageRequestText }: PublicProfileViewProps) {
  if (!profile) return null;

  const photos = profile.photos?.length ? profile.photos : ["/placeholder.svg"];

  return (
    <motion.div
      initial={{ y: "100%", opacity: 0.5 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-background/95 backdrop-blur-md pb-32"
    >
      <div className="mx-auto w-full max-w-md relative bg-background min-h-[100dvh]">
        {/* Sticky Header with Back Button */}
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white shadow-lg hover:bg-black/60 transition"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        </div>

        {/* Hero Photo (1st photo) */}
        <div className="relative h-[75vh] w-full overflow-hidden rounded-b-[2.5rem] shadow-xl">
          <img
            src={photos[0]}
            alt={profile.full_name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/50 to-transparent" />
          
          {/* Name & Title Overlay */}
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center gap-2">
              <h1 className="text-4xl font-black drop-shadow-md">
                {profile.full_name.split(' ')[0]}
                {profile.age ? <span className="font-light">, {profile.age}</span> : ""}
              </h1>
              {profile.verified && (
                <CheckCircle2 className="w-6 h-6 text-blue-500 drop-shadow-md" fill="currentColor" />
              )}
            </div>
            {(profile.occupation_title || profile.occupation_company) && (
              <p className="mt-2 text-lg text-white/90 flex items-center gap-1.5 font-medium">
                <Briefcase className="w-4 h-4" />
                {profile.occupation_title}
                {profile.occupation_company && ` at ${profile.occupation_company}`}
              </p>
            )}
          </div>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* Vitals Grid (Demographic Pills) */}
          <div className="flex flex-wrap gap-2">
            {profile.gender && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border text-sm font-semibold capitalize text-foreground">
                <span className="w-2 h-2 rounded-full gradient-brand" />
                {profile.gender}
              </div>
            )}
            {profile.intent && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-sm font-semibold">
                <Heart className="w-4 h-4" />
                {profile.intent}
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border text-sm font-semibold text-foreground">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              nearby
            </div>
          </div>

          {/* Incoming Message Request */}
          {messageRequestText && (
            <div className="p-5 bg-primary/10 border-2 border-primary/20 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <MessageCircle className="w-24 h-24" />
              </div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" /> Message Request
              </p>
              <p className="text-foreground text-lg leading-snug font-medium italic relative z-10">
                "{messageRequestText}"
              </p>
            </div>
          )}

          {/* Bio Section */}
          {profile.bio && (
            <div className="space-y-3">
              <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                <User className="w-5 h-5 text-primary" />
                About Me
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Second Photo */}
          {photos[1] && (
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-lg border border-border">
              <img src={photos[1]} alt="Gallery 1" className="h-full w-full object-cover" />
            </div>
          )}

          {/* Interests Section */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                <Heart className="w-5 h-5 text-rose-400" />
                Passions
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-4 py-2 bg-primary/10 text-primary text-sm font-bold rounded-2xl border border-primary/20"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Third Photo */}
          {photos[2] && (
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl shadow-lg border border-border mt-6">
              <img src={photos[2]} alt="Gallery 2" className="h-full w-full object-cover" />
            </div>
          )}
          
          {/* Spacing for bottom actions */}
          <div className="h-10" />
        </div>

        {/* Sticky Action Bar */}
        {actionButtons && (
          <div className="fixed bottom-0 inset-x-0 z-40 bg-gradient-to-t from-background via-background to-transparent pb-6 pt-12 flex justify-center pointer-events-none">
            <div className="w-full max-w-md px-6 pointer-events-auto">
              {actionButtons}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
