import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users as UsersIcon, ShieldCheck, PauseCircle, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  suspendedUsers: number;
  deletionRequestedUsers: number;
  femaleUsers: number;
  maleUsers: number;
  otherGender: number;
  intents: Record<string, number>;
}

const GOLD = "#C8973A";
const BRAND_RED = "#C8102E";
const EMERALD = "#10b981";
const WARM_GRAY = "#78716c";
const AMBER = "#f59e0b";
const PURPLE = "#a855f7";

const INTENT_COLORS = [GOLD, BRAND_RED, EMERALD, AMBER, PURPLE];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) throw error;
        if (!data) return;

        let verified = 0, male = 0, female = 0, other = 0;
        let suspended = 0, deletions = 0;
        const intents: Record<string, number> = {};

        data.forEach((p: any) => {
          if (p.verified) verified++;
          if (p.deletion_requested) deletions++;
          else if (p.deactivated_at) suspended++;

          const g = (p.gender ?? '').toLowerCase();
          if (g === 'male') male++;
          else if (g === 'female') female++;
          else other++;

          if (p.intent) intents[p.intent] = (intents[p.intent] ?? 0) + 1;
        });

        const activeUsers = data.filter(
          (p: any) => !p.deletion_requested && !p.deactivated_at && p.is_public
        ).length;

        setStats({
          totalUsers: data.length,
          activeUsers,
          verifiedUsers: verified,
          suspendedUsers: suspended,
          deletionRequestedUsers: deletions,
          maleUsers: male,
          femaleUsers: female,
          otherGender: other,
          intents,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading)
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-3 border-secondary/20 border-t-secondary rounded-full animate-spin" />
      </div>
    );

  const genderData = [
    { name: 'Female', value: stats?.femaleUsers ?? 0, color: BRAND_RED },
    { name: 'Male', value: stats?.maleUsers ?? 0, color: GOLD },
    { name: 'Other', value: stats?.otherGender ?? 0, color: WARM_GRAY },
  ].filter(d => d.value > 0);

  const intentData = stats
    ? Object.entries(stats.intents).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Platform Intelligence
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Live overview of membership, verification compliance, and retention health.
          </p>
        </div>
        <Link
          to="/users"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl gradient-brand text-white font-bold text-sm shadow-button hover:opacity-90 transition-all"
        >
          <span>Manage Accounts</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-6 rounded-3xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Members</span>
            <div className="w-10 h-10 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary">
              <UsersIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-foreground">{stats?.totalUsers ?? 0}</h2>
            <p className="text-xs text-emerald-500 font-semibold mt-1">{stats?.activeUsers ?? 0} active</p>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-3xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Verified Profiles</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-foreground">{stats?.verifiedUsers ?? 0}</h2>
            <p className="text-xs text-muted-foreground mt-1">Verified identity</p>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-3xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Suspended</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-500">
              <PauseCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-foreground">{stats?.suspendedUsers ?? 0}</h2>
            <p className="text-xs text-amber-500 font-medium mt-1">Deactivated by admin</p>
          </div>
        </div>

        <div className="bg-card border border-destructive/30 p-6 rounded-3xl shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-destructive font-semibold">Deletion Requests</span>
            <div className="w-10 h-10 rounded-2xl bg-destructive/15 flex items-center justify-center text-destructive">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-destructive">{stats?.deletionRequestedUsers ?? 0}</h2>
            <Link to="/users" className="text-xs text-muted-foreground hover:text-foreground underline mt-1 block">
              Review departures →
            </Link>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-card">
          <h3 className="text-lg font-bold text-foreground mb-1">Gender Demographics</h3>
          <p className="text-xs text-muted-foreground mb-6">Balanced distribution for intentional matchmaking</p>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genderData} innerRadius={65} outerRadius={85} paddingAngle={5} dataKey="value">
                  {genderData.map(entry => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#201c18',
                    border: '1px solid #332c25',
                    borderRadius: '12px',
                    color: '#f5f3ef',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-border">
            {genderData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs font-semibold text-foreground">
                  {d.name} ({d.value})
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-card">
          <h3 className="text-lg font-bold text-foreground mb-1">Relationship Intent</h3>
          <p className="text-xs text-muted-foreground mb-6">Stated goals of registered members</p>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={intentData}
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name ? name.split(' ')[0] : 'Other'} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {intentData.map((_, index) => (
                    <Cell key={index} fill={INTENT_COLORS[index % INTENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#201c18',
                    border: '1px solid #332c25',
                    borderRadius: '12px',
                    color: '#f5f3ef',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t border-border">
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
}
