import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users as UsersIcon, UserCheck, ShieldCheck,
  AlertTriangle, PauseCircle, ArrowUpRight, Sparkles,
  TrendingUp, Heart, CheckCircle2, UserX
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { adminService, type AdminStats } from "@/services/adminService";

// Obsidian & Gold luxury palette colors
const GOLD = "#C8973A";
const BRAND_RED = "#C8102E";
const EMERALD = "#10b981";
const WARM_GRAY = "#78716c";
const AMBER = "#f59e0b";
const ROSE = "#f43f5e";
const PURPLE = "#a855f7";

const INTENT_COLORS = [GOLD, BRAND_RED, EMERALD, AMBER, PURPLE, ROSE];

const DashboardPage = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const data = await adminService.fetchStats();
      setStats(data);
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-3 border-secondary/20 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  const genderData = [
    { name: "Female", value: stats?.femaleUsers || 0, color: BRAND_RED },
    { name: "Male", value: stats?.maleUsers || 0, color: GOLD },
    { name: "Other / Unspecified", value: stats?.otherGender || 0, color: WARM_GRAY },
  ].filter((d) => d.value > 0);

  const intentData = stats
    ? Object.entries(stats.intents).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Platform Intelligence
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Live overview of membership, verification compliance, and retention health.
          </p>
        </div>

        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl gradient-brand text-white font-bold text-sm shadow-button hover:opacity-90 transition-all"
        >
          <span>Manage Accounts</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ── KPI Metrics Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Users */}
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-6 shadow-card group hover:border-secondary/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Members
            </span>
            <div className="w-10 h-10 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary">
              <UsersIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              {stats?.totalUsers || 0}
            </h2>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-500 font-semibold">{stats?.activeUsers || 0} active</span>
              <span>across the diaspora</span>
            </p>
          </div>
        </div>

        {/* Verified Profiles */}
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-6 shadow-card group hover:border-secondary/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Verified Profiles
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              {stats?.verifiedUsers || 0}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.totalUsers
                ? Math.round(((stats.verifiedUsers || 0) / stats.totalUsers) * 100)
                : 0}
              % verified membership rate
            </p>
          </div>
        </div>

        {/* Suspended Accounts */}
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-6 shadow-card group hover:border-secondary/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Suspended Accounts
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-500">
              <PauseCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              {stats?.suspendedUsers || 0}
            </h2>
            <p className="text-xs text-amber-500 font-medium mt-1">
              Deactivated by administrator
            </p>
          </div>
        </div>

        {/* Self-Deleted / Pending */}
        <div className="relative overflow-hidden rounded-3xl bg-card border border-destructive/30 p-6 shadow-card group hover:border-destructive/50 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-destructive font-semibold">
              Deletion Requests
            </span>
            <div className="w-10 h-10 rounded-2xl bg-destructive/15 flex items-center justify-center text-destructive">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl sm:text-4xl font-black text-destructive tracking-tight">
              {stats?.deletionRequestedUsers || 0}
            </h2>
            <Link
              to="/admin/users"
              className="text-xs text-muted-foreground hover:text-foreground underline mt-1 block"
            >
              Review departure reasons →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Charts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Demographics */}
        <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-foreground">Gender Demographics</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Balanced distribution for intentional matchmaking
              </p>
            </div>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#171513",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    color: "#f5f5f4",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mt-4 pt-4 border-t border-border/60">
            {genderData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-xs font-semibold text-foreground">
                  {d.name} <span className="text-muted-foreground">({d.value})</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Relationship Intent */}
        <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-foreground">Relationship Intent</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Stated goals of registered members
              </p>
            </div>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={intentData}
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name ? name.split(" ")[0] : "Other"} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {intentData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={INTENT_COLORS[index % INTENT_COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#171513",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    color: "#f5f5f4",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t border-border/60">
            {intentData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: INTENT_COLORS[i % INTENT_COLORS.length] }}
                />
                <span className="font-medium text-foreground">{d.name}</span>
                <span className="text-muted-foreground">({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
