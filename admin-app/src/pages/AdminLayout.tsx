import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Users, LogOut, ShieldCheck } from 'lucide-react';

const nav = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Users & Accounts', href: '/users', icon: Users },
  { label: 'Support Inquiries', href: '/messages', icon: MessageSquare },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  const handleLogout = () => {
    sessionStorage.removeItem('bll_admin_unlocked');
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-display selection:bg-secondary/30 selection:text-secondary-foreground">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-card border-r border-border fixed inset-y-0 left-0 z-40">
        {/* Brand */}
        <div className="p-6 border-b border-border">
          <div className="space-y-1">
            <h1 className="text-lg font-black tracking-tight text-foreground font-serif">
              Black<span className="text-primary">Love</span><span className="text-secondary">Link</span>
            </h1>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-secondary/15 text-secondary border border-secondary/30">
                <ShieldCheck className="w-3 h-3 text-secondary" />
                Admin Console
              </span>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-6 space-y-1.5">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-2">
            Navigation
          </p>
          {nav.map(item => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'gradient-brand text-white shadow-button'
                    : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-12 min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif font-black text-sm">
              Black<span className="text-primary">Love</span><span className="text-secondary">Link</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-secondary/15 text-secondary border border-secondary/30">
              Admin
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-muted"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 bg-card/95 backdrop-blur-md border-t border-border flex z-40 shadow-2xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {nav.map(item => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              to={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-bold transition-colors ${
                active ? 'text-secondary' : 'text-muted-foreground'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform ${active ? 'scale-110 text-primary' : ''}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
