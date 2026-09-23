import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import {
  ShieldCheck, UserX, Search, RefreshCw, Trash2, CheckCircle2,
  AlertTriangle, Eye, PauseCircle, PlayCircle, X, AlertOctagon
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

type TabFilter = 'all' | 'active' | 'suspended' | 'deletions' | 'verified';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  occupation_title: string;
  occupation_company: string;
  dob: string | null;
  age: number | null;
  gender: string | null;
  intent: string | null;
  interests: string[] | null;
  bio: string | null;
  photos: string[] | null;
  avatar_url: string | null;
  verified: boolean;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
  deactivated_at: string | null;
  scheduled_deletion_at: string | null;
  leave_reason: string | null;
  leave_feedback: string | null;
  deletion_requested: boolean;
  is_public: boolean;
  is_admin: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  // Modals state
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);
  const [userToSuspend, setUserToSuspend] = useState<Profile | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers((data as Profile[]) || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const counts = useMemo(() => {
    const total = users.length;
    const verified = users.filter(u => u.verified).length;
    const deletions = users.filter(u => u.deletion_requested).length;
    const suspended = users.filter(u => u.deactivated_at && !u.deletion_requested).length;
    const active = users.filter(u => !u.deletion_requested && !u.deactivated_at && u.is_public).length;
    return { total, active, suspended, deletions, verified };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (activeTab === 'active') {
        if (u.deletion_requested || u.deactivated_at || !u.is_public) return false;
      } else if (activeTab === 'suspended') {
        if (!u.deactivated_at || u.deletion_requested) return false;
      } else if (activeTab === 'deletions') {
        if (!u.deletion_requested) return false;
      } else if (activeTab === 'verified') {
        if (!u.verified) return false;
      }

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        u.full_name?.toLowerCase().includes(term) ||
        u.occupation_title?.toLowerCase().includes(term) ||
        u.occupation_company?.toLowerCase().includes(term) ||
        u.user_id?.toLowerCase().includes(term) ||
        u.gender?.toLowerCase().includes(term)
      );
    });
  }, [users, activeTab, searchTerm]);

  // Action: Suspend
  const handleConfirmSuspend = async () => {
    if (!userToSuspend) return;
    setIsProcessing(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          is_public: false,
          deactivated_at: new Date().toISOString(),
          leave_reason: suspendReason.trim() || 'Suspended by administrator',
          deletion_requested: false,
        })
        .or(`id.eq.${userToSuspend.id},user_id.eq.${userToSuspend.user_id}`)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('No user profile was found to update.');

      toast.success(`Account for ${userToSuspend.full_name} has been suspended.`);
      setUserToSuspend(null);
      setSuspendReason('');
      await fetchUsers();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to suspend user.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Action: Reactivate
  const handleReactivate = async (user: Profile) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          is_public: true,
          deactivated_at: null,
          scheduled_deletion_at: null,
          leave_reason: null,
          leave_feedback: null,
          deletion_requested: false,
        })
        .or(`id.eq.${user.id},user_id.eq.${user.user_id}`)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('No user profile was found to update.');

      toast.success(`Account for ${user.full_name} has been restored & reactivated.`);
      await fetchUsers();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to reactivate user.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Action: Toggle Verified
  const handleToggleVerified = async (user: Profile) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ verified: !user.verified })
        .or(`id.eq.${user.id},user_id.eq.${user.user_id}`)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('No user profile was found to update.');

      toast.success(`${user.full_name} is now ${!user.verified ? 'Verified' : 'Unverified'}.`);
      setUsers(prev =>
        prev.map(u => (u.user_id === user.user_id || u.id === user.id ? { ...u, verified: !user.verified } : u))
      );
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to update verification.');
    }
  };

  // Action: Delete User
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsProcessing(true);
    try {
      const uid = userToDelete.user_id;
      const pid = userToDelete.id;

      // 1. Matches & messages
      try {
        const { data: matches } = await supabase
          .from('matches')
          .select('id')
          .or(`user_a.eq.${uid},user_b.eq.${uid}`);

        const matchIds = (matches || []).map((m: any) => m.id);
        if (matchIds.length > 0) {
          await supabase.from('messages').delete().in('match_id', matchIds);
        }
        await supabase.from('messages').delete().eq('sender_id', uid);
        await supabase.from('matches').delete().or(`user_a.eq.${uid},user_b.eq.${uid}`);
      } catch (err) {
        console.warn('Could not clean up matches/messages:', err);
      }

      // 2. Swipes
      try {
        await supabase.from('swipes').delete().or(`swiper_id.eq.${uid},swiped_id.eq.${uid}`);
      } catch (err) {
        console.warn('Could not delete swipes:', err);
      }

      // 3. Storage
      try {
        const { data: files } = await supabase.storage.from('profile-photos').list(uid);
        if (files && files.length > 0) {
          const filePaths = files.map((f: any) => `${uid}/${f.name}`);
          await supabase.storage.from('profile-photos').remove(filePaths);
        }
      } catch (err) {
        console.warn('Could not remove storage files:', err);
      }

      // 4. Delete profile row
      const { data: deleted, error } = await supabase
        .from('profiles')
        .delete()
        .or(`id.eq.${pid},user_id.eq.${uid}`)
        .select();

      if (error) throw error;

      // 5. Auth user
      try {
        await supabase.auth.admin.deleteUser(uid);
      } catch (err) {
        console.warn('Could not delete auth user:', err);
      }

      toast.success(`Account for ${userToDelete.full_name} has been permanently deleted.`);
      setUserToDelete(null);
      setUsers(prev => prev.filter(u => u.user_id !== uid && u.id !== pid));
      if (selectedUser?.user_id === uid || selectedUser?.id === pid) setSelectedUser(null);
      await fetchUsers();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to delete user.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            User Accounts
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Comprehensive account management, suspensions, deletion tracking, and verifications.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground hover:bg-muted text-sm font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-secondary' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1.5 bg-card border border-border rounded-2xl overflow-x-auto">
          {[
            { id: 'all', label: 'All Users', count: counts.total },
            { id: 'active', label: 'Active', count: counts.active },
            { id: 'suspended', label: 'Suspended', count: counts.suspended },
            { id: 'deletions', label: 'Self-Deleted / Pending', count: counts.deletions, alert: counts.deletions > 0 },
            { id: 'verified', label: 'Verified', count: counts.verified },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabFilter)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'gradient-brand text-white shadow-button'
                    : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-black leading-none ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : tab.alert
                      ? 'bg-destructive/15 text-destructive border border-destructive/30'
                      : 'bg-muted text-foreground/80'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, job, gender, ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-secondary outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 text-muted-foreground font-bold uppercase tracking-wider text-[11px] border-b border-border">
              <tr>
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Demographics</th>
                <th className="px-6 py-4">Career / Intent</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="w-8 h-8 border-3 border-secondary/20 border-t-secondary rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Loading accounts…</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                      <UserX className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-foreground text-base">No accounts found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isSelfDeleted = user.deletion_requested;
                  const isSuspended = !isSelfDeleted && Boolean(user.deactivated_at);

                  return (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-11 h-11 rounded-2xl bg-muted overflow-hidden shrink-0 border border-border">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full gradient-brand opacity-60 flex items-center justify-center text-white font-bold text-base">
                                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                              </div>
                            )}
                            {user.verified && (
                              <span className="absolute bottom-0 right-0 p-0.5 bg-secondary text-background rounded-tl-lg">
                                <CheckCircle2 className="w-3 h-3 text-background" />
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground">{user.full_name || 'Unnamed'}</span>
                              {user.is_admin && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-black bg-secondary/15 text-secondary border border-secondary/30">
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono truncate max-w-[160px]">{user.user_id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground text-xs sm:text-sm">
                          {user.age ? `${user.age} yrs` : 'Age N/A'} • {user.gender || 'Not specified'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{user.dob ? `DOB: ${user.dob}` : 'No DOB'}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground text-xs sm:text-sm truncate max-w-[180px]">
                          {user.occupation_title || user.occupation_company ? (
                            <span>
                              {user.occupation_title || 'Role'}
                              {user.occupation_company ? ` at ${user.occupation_company}` : ''}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic">Career not specified</span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-secondary mt-0.5">{user.intent || 'No intent set'}</div>
                      </td>

                      <td className="px-6 py-4">
                        {isSelfDeleted ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-destructive/15 text-destructive border border-destructive/30 font-bold text-xs">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Deletion Requested
                            </span>
                            {user.scheduled_deletion_at && (
                              <p className="text-[11px] text-muted-foreground">
                                Purge: {format(new Date(user.scheduled_deletion_at), 'MMM d, yyyy')}
                              </p>
                            )}
                            {user.leave_reason && (
                              <p className="text-[11px] text-muted-foreground italic truncate max-w-[180px]">
                                "{user.leave_reason}"
                              </p>
                            )}
                          </div>
                        ) : isSuspended ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/30 font-bold text-xs">
                              <PauseCircle className="w-3.5 h-3.5" />
                              Suspended
                            </span>
                            {user.leave_reason && (
                              <p className="text-[11px] text-muted-foreground italic truncate max-w-[180px]">
                                {user.leave_reason}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 font-bold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active Member
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                        {user.created_at ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true }) : 'N/A'}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="View Full Profile Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleVerified(user)}
                            className={`p-2 rounded-xl transition-colors ${
                              user.verified ? 'text-secondary hover:bg-secondary/10' : 'text-muted-foreground hover:text-secondary hover:bg-muted'
                            }`}
                            title={user.verified ? 'Remove Verification' : 'Grant Verification'}
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>

                          {isSelfDeleted || isSuspended ? (
                            <button
                              onClick={() => handleReactivate(user)}
                              className="p-2 rounded-xl text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                              title="Restore & Reactivate"
                            >
                              <PlayCircle className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setUserToSuspend(user)}
                              className="p-2 rounded-xl text-amber-500 hover:bg-amber-500/10 transition-colors"
                              title="Suspend User"
                            >
                              <PauseCircle className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => setUserToDelete(user)}
                            className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Permanently Delete Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-start justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-muted overflow-hidden border border-border">
                    {selectedUser.avatar_url ? (
                      <img src={selectedUser.avatar_url} alt={selectedUser.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full gradient-brand opacity-60 flex items-center justify-center text-white font-black text-xl">
                        {selectedUser.full_name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      {selectedUser.full_name || 'Unnamed'}
                      {selectedUser.verified && (
                        <span className="p-0.5 bg-secondary text-background rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-muted-foreground font-mono">ID: {selectedUser.user_id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Uploaded Photos ({selectedUser.photos?.filter(Boolean).length || 0})
                </p>
                {selectedUser.photos && selectedUser.photos.filter(Boolean).length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                    {selectedUser.photos.filter(Boolean).map((photoUrl, i) => (
                      <a
                        key={i}
                        href={photoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="relative aspect-square rounded-xl overflow-hidden border border-border group bg-muted"
                      >
                        <img src={photoUrl} alt={`Photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No photos uploaded.</p>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 bg-muted/30 p-4 rounded-2xl border border-border/60 text-xs">
                <div>
                  <span className="text-muted-foreground block">Age & Gender</span>
                  <span className="font-bold text-foreground">{selectedUser.age ? `${selectedUser.age} yrs` : 'N/A'} • {selectedUser.gender || 'Unspecified'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Date of Birth</span>
                  <span className="font-bold text-foreground">{selectedUser.dob || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Intent</span>
                  <span className="font-bold text-secondary">{selectedUser.intent || 'None specified'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Job Title</span>
                  <span className="font-bold text-foreground">{selectedUser.occupation_title || 'None'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Company</span>
                  <span className="font-bold text-foreground">{selectedUser.occupation_company || 'None'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Registered</span>
                  <span className="font-bold text-foreground">{selectedUser.created_at ? format(new Date(selectedUser.created_at), 'PP') : 'N/A'}</span>
                </div>
              </div>

              {(selectedUser.deletion_requested || selectedUser.deactivated_at) && (
                <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 space-y-1 text-xs text-destructive">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    {selectedUser.deletion_requested ? 'Account Deletion Requested' : 'Account Suspended'}
                  </p>
                  {selectedUser.scheduled_deletion_at && (
                    <p>Scheduled permanent purge: {format(new Date(selectedUser.scheduled_deletion_at), 'PPpp')}</p>
                  )}
                  {selectedUser.leave_reason && <p>Reason: "{selectedUser.leave_reason}"</p>}
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-border">
                <button
                  onClick={() => setUserToDelete(selectedUser)}
                  className="px-4 py-2 rounded-xl text-destructive hover:bg-destructive/10 font-bold text-xs flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Permanently
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-xl bg-muted text-foreground font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Suspend Modal */}
      <AnimatePresence>
        {userToSuspend && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-500 mx-auto">
                <PauseCircle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-foreground">Suspend {userToSuspend.full_name}?</h3>
                <p className="text-xs text-muted-foreground">Account will be hidden from matching immediately.</p>
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-foreground">Reason for Suspension (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Inappropriate behavior..."
                  value={suspendReason}
                  onChange={e => setSuspendReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground outline-none focus:border-secondary"
                />
              </div>
              <div className="flex gap-2.5 pt-2">
                <button onClick={() => setUserToSuspend(null)} className="flex-1 py-2.5 rounded-xl bg-muted text-foreground text-xs font-bold">
                  Cancel
                </button>
                <button onClick={handleConfirmSuspend} disabled={isProcessing} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold">
                  {isProcessing ? 'Suspending...' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-card border border-destructive/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center text-destructive mx-auto">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-foreground">Permanently Delete {userToDelete.full_name}?</h3>
                <p className="text-xs text-destructive font-medium">WARNING: This will permanently wipe all profile data, matches, swipes, and messages. This cannot be undone.</p>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button onClick={() => setUserToDelete(null)} className="flex-1 py-2.5 rounded-xl bg-muted text-foreground text-xs font-bold">
                  Cancel
                </button>
                <button onClick={handleConfirmDelete} disabled={isProcessing} className="flex-1 py-2.5 rounded-xl bg-destructive text-white text-xs font-bold">
                  {isProcessing ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
