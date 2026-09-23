import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, MessageSquare, Users, LogOut, ExternalLink, ShieldCheck } from "lucide-react";
import { Outlet } from "react-router-dom";
import BrandName from "@/components/BrandName";

const navigation = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Users & Accounts", href: "/admin/users", icon: Users },
  { name: "Support Inquiries", href: "/admin/messages", icon: MessageSquare },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (href: string) =>
    href === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(href);

  const handleExit = () => {
    sessionStorage.removeItem("admin_unlocked");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-display selection:bg-secondary/30 selection:text-secondary-foreground">
      {/* ── Desktop Obsidian & Gold Sidebar ── */}
      <aside className="hidden w-72 md:flex md:flex-col bg-card/80 backdrop-blur-xl border-r border-border shrink-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-border/60">
          <Link to="/" className="group block space-y-1.5">
            <div className="text-xl font-black tracking-tight leading-none">
              <BrandName />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-secondary/15 text-secondary border border-secondary/30">
                <ShieldCheck className="w-3 h-3 text-secondary" />
                Admin Console
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">v2.4</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-2">
            Navigation
          </p>
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                  active
                    ? "gradient-brand text-white shadow-button"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`} />
                <span>{item.name}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </Link>
            );
          })}

          <div className="pt-6">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-2">
              Quick Links
            </p>
            <Link
              to="/swipe"
              className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <span>View Match Feed</span>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            </Link>
            <Link
              to="/"
              className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <span>Main Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            </Link>
          </div>
        </nav>

        {/* User / Exit Footer */}
        <div className="p-4 border-t border-border/60 bg-muted/20">
          <button
            onClick={handleExit}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            Lock & Exit Admin
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Mobile Top Bar */}
        <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-5 py-3.5 bg-card/90 backdrop-blur-xl border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-serif italic text-base font-black">
              <BrandName />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-secondary/15 text-secondary border border-secondary/30">
              Admin
            </span>
          </Link>
          <button
            onClick={handleExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Exit
          </button>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto pb-28 md:pb-12">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-2xl border-t border-border flex pb-safe shadow-2xl">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-bold transition-all duration-200 ${
                active ? "text-secondary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform ${active ? "scale-110 text-primary" : ""}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminLayout;
