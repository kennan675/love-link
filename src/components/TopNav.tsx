import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Home, Heart, Users, MessageCircle, User as UserIcon,
  Bell, Menu, ArrowLeft, X, Globe,
} from "lucide-react";

// Custom BlackLoveLink discover icon — two interlocking rings (our chain/link brand mark)
const LinkedRingsIcon = ({ className, filled }: { className?: string; filled?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    {filled ? (
      <>
        {/* Left ring filled */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.5 4a5.5 5.5 0 1 0 3.18 9.97A7.47 7.47 0 0 1 10.5 12c0-.7.09-1.38.26-2.03A3.5 3.5 0 1 1 8.5 4Z"
          fill="currentColor"
        />
        {/* Right ring filled */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.5 4a5.5 5.5 0 1 1-3.18 9.97A7.47 7.47 0 0 0 13.5 12c0-.7-.09-1.38-.26-2.03A3.5 3.5 0 1 0 15.5 4Z"
          fill="currentColor"
        />
      </>
    ) : (
      <>
        {/* Left ring outline */}
        <circle cx="8.5" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
        {/* Right ring outline */}
        <circle cx="15.5" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
      </>
    )}
  </svg>
);
import logo from "@/assets/blacklovelink-logo-icon.png";
import LeftRail from "@/components/shell/LeftRail";
import RightRail from "@/components/shell/RightRail";
import NotificationPanel from "@/components/NotificationPanel";
import { useNotifications } from "@/hooks/useNotifications";
import { useTranslation } from "@/hooks/useTranslation";
import { Language, languageNames } from "@/contexts/LanguageContext";




const TopNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const { unreadCount } = useNotifications();
  const { language, setLanguage, t } = useTranslation();

  const tabs = [
    { to: "/swipe", icon: null, label: t.app.discover, isLinkedRings: true },
    { to: "/likes", icon: Heart, label: t.app.likes, isLinkedRings: false },
    { to: "/community", icon: Users, label: t.app.community, isLinkedRings: false },
    { to: "/messages", icon: MessageCircle, label: t.app.messages, isLinkedRings: false },
    { to: "/profile", icon: UserIcon, label: t.app.profile, isLinkedRings: false },
  ];

  // Toggle body padding so fixed rails don't overlap content on lg+
  useEffect(() => {
    document.body.classList.add("app-shell-active");
    return () => document.body.classList.remove("app-shell-active");
  }, []);

  // Inject safe-area padding-bottom CSS variable for the bottom nav
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `.bottom-safe-tab { padding-bottom: env(safe-area-inset-bottom, 0px); height: calc(3.5rem + env(safe-area-inset-bottom, 0px)); }`;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Close notification panel on route change
  useEffect(() => {
    setNotifOpen(false);
  }, [location.pathname]);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/swipe?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      searchRef.current?.blur();
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchQuery("");
      searchRef.current?.blur();
    }
  };

  return (
    <>
      {/* ── FACEBOOK-STYLE TOP HEADER ───────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-sm">
        <div className="flex items-center justify-between gap-2 h-14 px-2 sm:px-4">
          {/* Left: logo + search */}
          <div className="flex items-center gap-2 flex-1 min-w-0 max-w-[360px]">
            <Link to="/" aria-label="Home" className="shrink-0">
              <img src={logo} alt="BlackLoveLink" className="h-9 w-9 rounded-full object-cover" />
            </Link>
            <form onSubmit={handleSearch} className="relative flex-1 min-w-0 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onKeyDown={handleSearchKeyDown}
                placeholder={t.app.search}
                className="w-full h-10 pl-9 pr-8 rounded-full bg-muted text-sm text-foreground placeholder:text-muted-foreground border border-transparent focus:outline-none focus:border-primary/40 focus:bg-background transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted-foreground/20 text-muted-foreground"
                  tabIndex={-1}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
            <button
              onClick={() => navigate(-1)}
              className="sm:hidden p-2 rounded-full hover:bg-muted text-muted-foreground"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Center: tab nav */}
          <nav className="hidden md:flex items-center justify-center flex-1 max-w-2xl">
            {tabs.map(({ to, icon: Icon, label, isLinkedRings }) => {
              const active = location.pathname === to;
              return (
                <NavLink
                  key={to}
                  to={to}
                  aria-label={label}
                  className="relative flex items-center justify-center h-14 w-[88px] lg:w-[112px] group"
                >
                  {isLinkedRings ? (
                    <LinkedRingsIcon
                      className={`w-6 h-6 transition-colors ${
                        active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      }`}
                      filled={active}
                    />
                  ) : (
                    Icon && <Icon
                      className={`w-6 h-6 transition-colors ${
                        active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      }`}
                      fill={active ? "currentColor" : "none"}
                      strokeWidth={active ? 2.4 : 2}
                    />
                  )}
                  {active && (
                    <motion.div
                      layoutId="topnav-indicator"
                      className="absolute bottom-0 left-2 right-2 h-[3px] rounded-full bg-primary"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Right: actions */}
          <div className="flex items-center justify-end gap-1.5 flex-1 max-w-[360px]">
            {/* Language switcher */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen(v => !v)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-foreground transition-colors ${
                  langOpen ? "bg-primary/10 text-primary" : "bg-muted hover:bg-muted/70"
                }`}
                aria-label="Change language"
              >
                <Globe className="w-5 h-5" />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-card border border-border shadow-2xl z-50 overflow-hidden">
                  <div className="p-2">
                    {(Object.keys(languageNames) as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => { setLanguage(lang); setLangOpen(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm font-medium rounded-xl transition-all duration-150 ${
                          language === lang
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-accent/50"
                        }`}
                      >
                        {languageNames[lang]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className="hidden sm:flex w-10 h-10 rounded-full bg-muted hover:bg-muted/70 items-center justify-center text-foreground">
              <Menu className="w-5 h-5" />
            </button>
            <Link
              to="/messages"
              className="hidden sm:flex w-10 h-10 rounded-full bg-muted hover:bg-muted/70 items-center justify-center text-foreground relative"
            >
              <MessageCircle className="w-5 h-5" />
            </Link>

            {/* Bell — now functional */}
            <button
              onClick={() => setNotifOpen(v => !v)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-foreground relative transition-colors ${
                notifOpen ? "bg-primary/10 text-primary" : "bg-muted hover:bg-muted/70"
              }`}
              aria-label="Notifications"
              aria-expanded={notifOpen}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[0.65rem] h-[0.65rem] rounded-full bg-primary ring-2 ring-card flex items-center justify-center">
                  {unreadCount > 9 && (
                    <span className="text-[8px] font-bold text-white leading-none px-0.5">{unreadCount > 99 ? "99+" : unreadCount}</span>
                  )}
                </span>
              )}
            </button>

            <Link
              to="/profile"
              aria-label="Your profile"
              className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold"
            >
              <UserIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── DESKTOP RAILS ───────────────────────────────────────────── */}
      <LeftRail />
      <RightRail />

      {/* ── MOBILE BOTTOM TAB BAR ───────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-card border-t border-border flex items-center justify-around bottom-safe-tab">
        {tabs.map(({ to, icon: Icon, label, isLinkedRings }) => {
          const active = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              aria-label={label}
              className="relative flex flex-col items-center justify-center flex-1 h-14"
            >
              {isLinkedRings ? (
                <LinkedRingsIcon
                  className={`w-6 h-6 ${active ? "text-primary" : "text-muted-foreground"}`}
                  filled={active}
                />
              ) : (
                Icon && <Icon
                  className={`w-6 h-6 ${active ? "text-primary" : "text-muted-foreground"}`}
                  fill={active ? "currentColor" : "none"}
                  strokeWidth={active ? 2.4 : 2}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── NOTIFICATION PANEL ──────────────────────────────────────── */}
      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
};

export default TopNav;
