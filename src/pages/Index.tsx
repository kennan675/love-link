import { Flame, Globe, ArrowUpRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";
import coupleHero from "@/assets/couple-hero.jpg";
import story1 from "@/assets/story-1.jpg";
import story2 from "@/assets/story-2.jpg";
import story3 from "@/assets/story-3.jpg";
import story4 from "@/assets/story-4.jpg";

const navLinks = ["Products", "Learn", "Safety", "Support", "Download"];

const stories = [
  { tag: "Married", title: "One Walk, Two Lockdowns, a Cat, and a Ring.", names: "Elena & Giulia", image: story1 },
  { tag: "Married", title: "First Came Face Masks, Then Came Love", names: "Amanda & Miguel", image: story2 },
  { tag: "Married", title: "Met on Tinder, Approved by a Psychic, Married by the Sea", names: "Will & Monte", image: story3 },
  { tag: "Dating", title: "New City, First Date, Forever Love", names: "Aashna & Prateek", image: story4 },
];

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
            <span className="text-3xl font-extrabold tracking-tight text-primary-foreground">tinder</span>
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
            className="text-6xl font-black tracking-tight text-primary-foreground sm:text-8xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Swipe Right<sup className="text-2xl sm:text-4xl align-super">™</sup>
          </motion.h1>

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
            A new relationship starts on Tinder<br />every <span className="font-bold">3 seconds</span> around the globe
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
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left – text */}
            <div>
              <h2 className="text-5xl font-black leading-[1.1] tracking-tight text-background sm:text-6xl lg:text-7xl">
                Made a great connection.
              </h2>
              <p className="mt-6 max-w-md text-lg text-background/60 leading-relaxed">
                Your moment belongs here. Share meaningful and authentic stories that ignite confidence and joy.
              </p>
              <button className="mt-10 rounded-full bg-background px-10 py-4 text-base font-bold text-primary-foreground transition-transform hover:scale-105">
                Share your story
              </button>
            </div>

            {/* Right – overlapping cards with interest tags */}
            <div className="relative flex justify-center lg:justify-end">
              {/* Card 1 – main */}
              <div className="relative z-10 w-72 sm:w-80 rounded-2xl overflow-hidden shadow-xl rotate-[-3deg]">
                <img src={story1} alt="Story" className="h-[420px] w-full object-cover" />
                {/* Tag */}
                <span className="absolute top-6 right-[-16px] gradient-brand text-primary-foreground text-sm font-bold px-4 py-2 rounded-full rotate-[18deg] shadow-lg">
                  Adventurer
                </span>
              </div>

              {/* Card 2 – behind right */}
              <div className="absolute right-0 top-8 z-20 w-56 sm:w-64 rounded-2xl overflow-hidden shadow-xl rotate-[5deg] translate-x-8 sm:translate-x-16">
                <img src={story2} alt="Story" className="h-[360px] w-full object-cover" />
                <span className="absolute top-10 right-[-10px] gradient-brand text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full rotate-[22deg] shadow-lg">
                  Foodie
                </span>
              </div>

              {/* Card 3 – behind left */}
              <div className="absolute left-0 top-16 z-0 w-48 sm:w-56 rounded-2xl overflow-hidden shadow-lg rotate-[-8deg] -translate-x-4 sm:-translate-x-8 opacity-70">
                <img src={story3} alt="Story" className="h-[320px] w-full object-cover" />
                <span className="absolute top-4 right-[-8px] gradient-brand text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full rotate-[15deg] shadow-lg">
                  Explorer
                </span>
              </div>
            </div>
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
