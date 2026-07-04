import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Heart, Users, MessageCircle, User as UserIcon,
  Settings, ShieldCheck, Sparkles, BookOpen, HelpCircle,
} from "lucide-react";

// Custom BlackLoveLink discover icon — two interlocking rings (matches TopNav)
const LinkedRingsIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <circle cx="8.5" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
    <circle cx="15.5" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const primary = [
  { to: "/swipe",     icon: null,          label: "Discover",     isLinkedRings: true  },
  { to: "/likes",     icon: Heart,         label: "Who liked you", isLinkedRings: false },
  { to: "/community", icon: Users,         label: "Community",    isLinkedRings: false },
  { to: "/messages",  icon: MessageCircle, label: "Messages",     isLinkedRings: false },
  { to: "/profile",   icon: UserIcon,      label: "Your profile", isLinkedRings: false },
];

const shortcuts = [
  { to: "/connections",   icon: Sparkles,   label: "Smart matches"   },
  { to: "/education",     icon: BookOpen,   label: "Relationship hub" },
  { to: "/trust-safety",  icon: ShieldCheck,label: "Trust & safety"  },
  { to: "/support",       icon: HelpCircle, label: "Help center"     },
  { to: "/settings",      icon: Settings,   label: "Settings"        },
];

const Item = ({
  to, icon: Icon, label, isLinkedRings = false,
}: {
  to: string;
  icon: any;
  label: string;
  isLinkedRings?: boolean;
}) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
        isActive
          ? "bg-primary/10 text-primary font-semibold"
          : "text-foreground hover:bg-muted"
      }`
    }
  >
    <span className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
      {isLinkedRings
        ? <LinkedRingsIcon className="w-5 h-5" />
        : Icon && <Icon className="w-5 h-5" />
      }
    </span>
    <span className="text-sm">{label}</span>
  </NavLink>
);

export default function LeftRail() {
  return (
    <aside className="hidden lg:flex fixed left-0 top-14 bottom-0 w-[280px] z-40 flex-col p-3 overflow-y-auto bg-background border-r border-border">
      <nav className="flex flex-col gap-0.5">
        {primary.map((i) => <Item key={i.to} {...i} />)}
      </nav>
      <div className="my-3 border-t border-border" />
      <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shortcuts</p>
      <nav className="flex flex-col gap-0.5">
        {shortcuts.map((i) => <Item key={i.to} {...i} />)}
      </nav>
      <div className="mt-auto pt-4 px-3 text-[11px] text-muted-foreground">
        <p>BlackLoveLink · {new Date().getFullYear()}</p>
        <p className="mt-1">
          <Link to="/privacy-policy" className="hover:underline">Privacy</Link>
          {" · "}
          <Link to="/terms-of-service" className="hover:underline">Terms</Link>
          {" · "}
          <Link to="/cookie-policy" className="hover:underline">Cookies</Link>
        </p>
      </div>
    </aside>
  );
}