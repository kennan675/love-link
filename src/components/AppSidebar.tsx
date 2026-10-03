import { NavLink, useLocation } from "react-router-dom";
import { Menu, Home, Heart, Users, MessageCircle, User, Settings, HelpCircle, ShieldCheck, Compass, BookOpen, Phone, Globe, Award, Link2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import { Capacitor } from "@capacitor/core";

const appLinks = [
  { to: "/swipe", label: "Discover", icon: Home },
  { to: "/likes", label: "Likes", icon: Heart },
  { to: "/connections", label: "Connections", icon: Link2 },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/community", label: "Community", icon: Users },
  { to: "/profile", label: "My Profile", icon: User },
];

const exploreLinks = [
  { to: "/how-it-works", label: "How It Works", icon: Compass },
  { to: "/success-stories", label: "Success Stories", icon: Award },
  { to: "/trust-safety", label: "Trust & Safety", icon: ShieldCheck },
  { to: "/education", label: "Relationship Hub", icon: BookOpen },
  { to: "/support", label: "Support", icon: HelpCircle },
  { to: "/contact", label: "Contact Us", icon: Phone },
  { to: "/settings", label: "Settings", icon: Settings },
];

const WEBSITE = "https://blacklovelink.com";

const openWebsite = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      const mod = "@capacitor/browser";
      const { Browser } = await import(/* @vite-ignore */ mod);
      await Browser.open({ url: WEBSITE });
      return;
    } catch { /* fall through */ }
    window.open(WEBSITE, "_system");
    return;
  }
  window.open(WEBSITE, "_blank", "noopener,noreferrer");
};

const AppSidebar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const Item = ({ to, label, icon: Icon }: { to: string; label: string; icon: any }) => {
    const active = pathname === to;
    return (
      <NavLink
        to={to}
        onClick={() => setOpen(false)}
        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${
          active ? "bg-accent text-accent-foreground shadow" : "text-foreground hover:bg-muted"
        }`}
      >
        <Icon className="h-5 w-5" />
        {label}
      </NavLink>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button aria-label="Open menu" className="p-1.5 -ml-1 rounded-full hover:bg-muted text-foreground transition-colors">
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[290px] p-0 flex flex-col bg-card">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <div className="px-5 pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] pb-4">
          <span className="font-serif italic font-bold text-xl">
            <span className="text-foreground">black</span><span className="text-primary">love</span><span className="text-secondary">link</span>
          </span>
          <div className="mt-3 flex gap-1.5">
            <span className="h-1 w-16 rounded-full bg-primary" />
            <span className="h-1 w-16 rounded-full bg-accent" />
            <span className="h-1 w-16 rounded-full bg-secondary" />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
          {appLinks.map((l) => <Item key={l.to} {...l} />)}
          <p className="px-4 pt-5 pb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Explore</p>
          {exploreLinks.map((l) => <Item key={l.to} {...l} />)}
        </nav>
        <div className="p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] border-t border-border">
          <button
            onClick={() => { setOpen(false); openWebsite(); }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-bold uppercase tracking-wide"
          >
            <Globe className="h-4 w-4" /> Visit our website
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AppSidebar;
