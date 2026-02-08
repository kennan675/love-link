import { Flame, Globe, ArrowUpRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";
import coupleHero from "@/assets/couple-hero.jpg";
import profile1 from "@/assets/profile-1.jpg";
import profile2 from "@/assets/profile-2.jpg";
import profile3 from "@/assets/profile-3.jpg";
import ConnectionCards from "@/components/ConnectionCards";

const navLinks = ["Home", "How It Works", "Success Stories", "Safety & Trust", "Support", "Download App"];


const footerLinks = {
  Legal: ["Privacy", "Consumer Health Data", "Privacy Policy", "Terms", "Cookie Policy", "Intellectual Property", "Accessibility Statement"],
  Careers: ["Careers Portal", "Tech Blog"],
  Social: [],
  "": ["FAQ", "Destinations", "Press Room", "Contact", "Promo Code"],
};

const Index = () => {
  return (
    <div className="min-h-screen bg-foreground font-display">
      {/* ── NAVBAR ── */}
      <header className="absolute inset-x-0 top-0 z-30">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-1">
            <Flame className="h-8 w-8 text-primary-foreground" fill="currentColor" />
            <span className="text-3xl font-extrabold tracking-tight text-primary-foreground">BlackLoveLink</span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <a key={l} href="#" className="text-sm font-semibold text-primary-foreground/90 underline decoration-primary-foreground/40 underline-offset-4 hover:text-primary-foreground">
                {l}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden items-center gap-1.5 text-sm font-semibold text-primary-foreground/90 md:flex">
              <Globe className="h-4 w-4" /> Language
            </button>
            <Link
              to="/swipe"
              className="rounded-full bg-primary-foreground px-6 py-2.5 text-sm font-bold text-background transition-opacity hover:opacity-90"
            >
              Log in
            </Link>
          </div>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <img
          src={heroBg}
          alt="Tinder profiles on phones"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 text-center px-4">
          <motion.h1
            className="text-5xl font-black tracking-tight text-primary-foreground sm:text-7xl lg:text-8xl leading-[1.1]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            A New Relationship Begins on{" "}
            <span className="text-gradient-brand">BlackLoveLink</span>
          </motion.h1>
          <motion.p
            className="mt-6 mx-auto max-w-2xl text-xl text-primary-foreground/80 font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            Because Real Love Grows When Values Align
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-10"
          >
            <Link
              to="/swipe"
              className="gradient-brand inline-block rounded-full px-12 py-4 text-lg font-bold text-primary-foreground shadow-button transition-opacity hover:opacity-90"
            >
              Create account
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── MISSION SECTION (Light Theme) ── */}
      <section className="relative bg-primary-foreground px-6 py-28 lg:py-36 overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left – Text Content */}
            <div>
              <motion.h2
                className="text-4xl font-black leading-[1.1] tracking-tight text-background sm:text-5xl lg:text-6xl"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                Connections That{" "}
                <span className="text-gradient-brand">Speak Your Love Language</span>
              </motion.h2>

              <motion.p
                className="mt-8 max-w-xl text-lg leading-relaxed text-background/70"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Empowering vetted accomplished Black professionals and like-minded
                individuals to overcome loneliness and find meaningful connections,
                love, and community.
              </motion.p>

              <motion.p
                className="mt-6 max-w-xl text-base leading-relaxed text-background/50"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.35 }}
              >
                Join thousands of Black singles who've found meaningful connections
                on a platform that celebrates your identity, understands your culture,
                and prioritizes genuine compatibility over superficial swiping.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="mt-10"
              >
                <Link
                  to="/swipe"
                  className="gradient-brand inline-block rounded-full px-10 py-4 text-lg font-bold text-primary-foreground shadow-button transition-transform hover:scale-105"
                >
                  Find Your Connection
                </Link>
              </motion.div>
            </div>

            {/* Right – Feature Card with Stunning Visuals */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ perspective: "1000px" }}>
                {/* Main Image */}
                <img
                  src={coupleHero}
                  alt="Happy Black couple"
                  className="w-full h-[500px] object-cover"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Floating Stats Cards */}
                <motion.div
                  className="absolute top-6 right-6 bg-primary-foreground/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl"
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, type: "spring" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center">
                      <Flame className="h-5 w-5 text-primary-foreground" fill="currentColor" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-background">98%</p>
                      <p className="text-xs text-background/60">Match Success</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute top-24 left-6 bg-primary-foreground/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl"
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, type: "spring" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[hsl(45,100%,55%)] flex items-center justify-center">
                      <span className="text-background font-bold">✓</span>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-background">50K+</p>
                      <p className="text-xs text-background/60">Verified Profiles</p>
                    </div>
                  </div>
                </motion.div>

                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <motion.div
                    className="flex items-center gap-4"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1 }}
                  >
                    <div className="flex -space-x-3">
                      <img src={profile1} alt="" className="w-10 h-10 rounded-full border-2 border-primary-foreground object-cover" />
                      <img src={profile2} alt="" className="w-10 h-10 rounded-full border-2 border-primary-foreground object-cover" />
                      <img src={profile3} alt="" className="w-10 h-10 rounded-full border-2 border-primary-foreground object-cover" />
                      <div className="w-10 h-10 rounded-full border-2 border-primary-foreground gradient-brand flex items-center justify-center text-xs font-bold text-primary-foreground">
                        +2K
                      </div>
                    </div>
                    <p className="text-primary-foreground text-sm font-medium">
                      Joined this week
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -bottom-4 -right-4 w-full h-full rounded-3xl border-2 border-background/10 -z-10" />
              <div className="absolute -bottom-8 -right-8 w-full h-full rounded-3xl border-2 border-background/5 -z-20" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="relative">
        <img
          src={coupleHero}
          alt="Happy couple"
          className="h-[70vh] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-12 text-center px-4">
          <h2 className="text-3xl font-light text-primary-foreground sm:text-5xl">
            A New Relationship Begins on <span className="font-bold">BlackLoveLink</span><br />Because Real Love Grows When Values Align
          </h2>
        </div>
      </section>

      {/* ── SWIPE STORIES BANNER ── */}
      <div className="gradient-brand py-4 text-center">
        <span className="text-lg font-bold text-primary-foreground">
          Swipe Stories™ <ChevronDown className="inline h-5 w-5" />
        </span>
      </div>

      {/* ── CONNECTION SECTION (Bumble-inspired) ── */}
      <section className="bg-primary-foreground px-6 py-24 lg:py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
            {/* Left – large bold text */}
            <div>
              <h2 className="text-5xl font-black leading-[1.05] tracking-tight text-background sm:text-6xl lg:text-[4.5rem]">
                Made a great<br />connection.
              </h2>
              <p className="mt-6 max-w-md text-lg text-background/50 leading-relaxed">
                Your moment belongs here. Share meaningful and authentic stories that ignite confidence and joy.
              </p>
              <button className="mt-10 rounded-full bg-background px-10 py-4 text-base font-bold text-primary-foreground transition-transform hover:scale-105">
                Share your story
              </button>
            </div>

            {/* Right – 3D rotating connection cards */}
            <ConnectionCards />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-background/10 bg-primary-foreground px-6 py-12">
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title || "extra"}>
              {title && <h5 className="mb-4 text-lg font-bold text-background">{title}</h5>}
              {title === "Social" ? (
                <div className="flex gap-4 text-background/60">
                  {["Instagram", "TikTok", "YouTube", "Twitter", "Facebook"].map((s) => (
                    <span key={s} className="text-sm hover:text-background cursor-pointer">{s}</span>
                  ))}
                </div>
              ) : (
                <ul className="space-y-2">
                  {links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-background/60 hover:text-background">{l}</a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default Index;
