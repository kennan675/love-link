import { User, MessageCircle, Flame } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

const TopNav = () => {
  const location = useLocation();

  const links = [
    { to: "/profile", icon: User, label: "Profile" },
    { to: "/swipe", icon: Flame, label: "Discover" },
    { to: "/messages", icon: MessageCircle, label: "Chat" },
  ];

  return (
    <nav className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
      {links.map(({ to, icon: Icon, label }) => {
        const active = location.pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-0.5 transition-colors ${
              active ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-6 w-6" fill={active && to === "/" ? "currentColor" : "none"} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default TopNav;
