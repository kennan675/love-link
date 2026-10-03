import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import {
  Heart,
  MessageSquare,
  Shield,
  Users,
  BookOpen,
  Compass,
  Globe,
  ChevronRight,
} from "lucide-react";
import SharedNavbar from "@/components/SharedNavbar";
import SiteFooter from "@/components/SiteFooter";

const categories = [
  {
    icon: MessageSquare,
    title: "Communication & Conversation",
    description: "Master the art of meaningful conversation, from the first message to deep, lasting dialogue.",
    articles: [
      "How to Start a Conversation That Leads Somewhere Real",
      "Active Listening: The Secret to Being Truly Heard",
      "Navigating Difficult Conversations with Grace",
      "Digital Communication Etiquette for Modern Dating",
    ],
    color: "from-primary to-secondary",
  },
  {
    icon: Heart,
    title: "Building Lasting Love",
    description: "Understand the foundations of relationships that go the distance — for professionals ready to settle down.",
    articles: [
      "From Dating to Commitment: Signs You're Ready",
      "Love Languages in African Relationships",
      "Building Trust in a Long-Distance Relationship",
      "Financial Compatibility: The Talk No One Has Early Enough",
    ],
    color: "from-secondary to-primary",
  },
  {
    icon: Shield,
    title: "Respect & Boundaries",
    description: "Healthy relationships start with mutual respect. Learn to set and honor boundaries.",
    articles: [
      "Setting Healthy Boundaries Without Guilt",
      "Recognizing Red Flags vs. Cultural Differences",
      "Consent and Communication in Modern Love",
      "How to Respectfully End a Connection That Isn't Working",
    ],
    color: "from-primary to-secondary",
  },
  {
    icon: Globe,
    title: "Cultural Dating Guides",
    description: "Navigate the beautiful complexities of dating across African cultures and the diaspora.",
    articles: [
      "Understanding Bride Price & Lobola in Modern Context",
      "Interfaith Relationships: Finding Common Ground",
      "Dating Across African Cultures: What to Know",
      "Diaspora Dating: Balancing Two Worlds",
    ],
    color: "from-secondary to-primary",
  },
  {
    icon: Compass,
    title: "Self-Improvement & Readiness",
    description: "Become the partner you want to attract. Growth starts from within.",
    articles: [
      "Are You Emotionally Ready for a Serious Relationship?",
      "Healing Before You Love Again",
      "Building Confidence in Your Dating Life",
      "Work-Life-Love Balance for Busy Professionals",
    ],
    color: "from-primary to-secondary",
  },
  {
    icon: Users,
    title: "Marriage & Partnership",
    description: "Practical wisdom for professionals who are done dating casually and ready to build a life together.",
    articles: [
      "What Makes Marriages Between Professionals Thrive",
      "Having 'The Talk' About Marriage Timelines",
      "Merging Lives: Careers, Families, and Futures",
      "Pre-Marital Counselling: Why It Matters",
    ],
    color: "from-secondary to-primary",
  },
];

const EducationPage = () => {
  return (
    <div className="min-h-screen bg-background font-display text-foreground">
      <SEO title={"Relationship Hub | BlackLoveLink"} description={"Expert guidance on dating, communication, and relationships for Black professionals seeking marriage-minded connections."} path="/education" ogType="website" />
      <SharedNavbar />

      {/* Hero */}
      <section className="px-6 pt-32 pb-20 lg:py-28 lg:pt-36">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 mb-6"
          >
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Relationship Hub</span>
          </motion.div>

          <motion.h1
            className="text-4xl font-black tracking-tight text-foreground sm:text-6xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Relationship Hub –{" "}
            <span className="text-gradient-brand">Connect Deeper</span>
          </motion.h1>

          <motion.p
            className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Expert-curated guides for accomplished Black professionals navigating serious
            relationships, marriage, and everything in between. Because love deserves intention.
          </motion.p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-7xl grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group rounded-2xl border border-border bg-card p-6 hover:bg-muted transition-all duration-300"
            >
              <div
                className={`inline-flex rounded-xl bg-gradient-to-br ${cat.color} p-3 mb-4`}
              >
                <cat.icon className="h-6 w-6 text-primary-foreground" />
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2">{cat.title}</h3>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                {cat.description}
              </p>

              <ul className="space-y-2">
                {cat.articles.map((article) => (
                  <li key={article}>
                    <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted transition-colors group/item">
                      <ChevronRight className="h-3.5 w-3.5 text-primary flex-shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      <span className="group-hover/item:text-foreground transition-colors">
                        {article}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-brand px-6 py-16 text-center">
        <h2 className="text-3xl font-black text-primary-foreground mb-4">
          Ready to Find Your Person?
        </h2>
        <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
          Put what you've learned into practice. Join BlackLoveLink and start making
          meaningful connections today.
        </p>
        <Link
          to="/auth"
          className="inline-block rounded-full bg-background px-10 py-4 text-lg font-bold text-foreground transition-transform hover:scale-105"
        >
          Start Your Journey
        </Link>
      </section>

      <SiteFooter />
    </div>
  );
};

export default EducationPage;
