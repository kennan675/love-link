import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import {
  ShieldCheck, UserX, Search, RefreshCw, Trash2, CheckCircle2,
  AlertTriangle, Eye, PauseCircle, PlayCircle, X, AlertOctagon,
  ImageOff, ShieldAlert, Images, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

type TabFilter = 'all' | 'active' | 'suspended' | 'deletions' | 'verified' | 'photos';

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

  // Photo selection & removal state (supports single photo or multiple selected photos)
  const [selectedUserPhotoUrls, setSelectedUserPhotoUrls] = useState<Set<string>>(new Set());
  const [selectedGlobalPhotoUrls, setSelectedGlobalPhotoUrls] = useState<Set<string>>(new Set());
  const [photosToRemove, setPhotosToRemove] = useState<{ url: string; user: Profile }[] | null>(null);
  const [removalNote, setRemovalNote] = useState('');
  const [isPhotoRemoving, setIsPhotoRemoving] = useState(false);

  // Clear modal selection when selectedUser changes
  useEffect(() => {
    setSelectedUserPhotoUrls(new Set());
  }, [selectedUser]);

  const DEFAULT_REMOVAL_MESSAGE = (name: string) =>
    `Hi ${name}, we have reviewed your profile and removed one of your photos as it does not comply with BlackLoveLink's professional community guidelines and image policies. Please upload a clear, professional photo of yourself. For questions, contact techhubafrica24@gmail.com.`;

  const POLICY_REASONS = [
    {
      label: "Not a photo of you / Object / Product",
      message: (name: string) =>
        `Hi ${name}, we reviewed your profile and removed one of your photos because it shows an object, product, or screenshot rather than a photo of yourself. BlackLoveLink requires all photos to feature you clearly. Please upload a photo of yourself. For questions, contact techhubafrica24@gmail.com.`,
    },
    {
      label: "Does not comply with policies",
      message: (name: string) =>
        `Hi ${name}, we've reviewed your profile and removed one of your photos as it does not comply with BlackLoveLink's professional community policies and standards. Please upload a replacement photo. For questions, contact techhubafrica24@gmail.com.`,
    },
    {
      label: "Inappropriate or indecent content",
      message: (name: string) =>
        `Hi ${name}, one of your uploaded photos was removed as it does not meet our professional community decency standards. Please upload a photo suitable for a professional platform. For questions, contact techhubafrica24@gmail.com.`,
    },
    {
      label: "Unclear face or low quality",
      message: (name: string) =>
        `Hi ${name}, we removed one of your photos because your face is obscured or the image quality does not meet our profile verification standards. Please upload a clear photo of yourself. For questions, contact techhubafrica24@gmail.com.`,
    },
  ];

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let data: Profile[] = [];
      const res = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!res.error && res.data) {
        data = res.data as Profile[];
      } else {
        console.warn('Primary supabase fetch failed, attempting public client fallback:', res.error);
        const { createClient } = await import('@supabase/supabase-js');
        const fallbackClient = createClient(
          'https://hxiycmrlyswwjqlwihdd.supabase.co',
          'sb_publishable_JFUMyQCrC-vLFej5fatodw_P2OyltEZ'
        );
        const fb = await fallbackClient
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (fb.error) throw res.error || fb.error;
        data = (fb.data as Profile[]) || [];
      }
      setUsers(data || []);
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

  const allPhotos = useMemo(() => {
    return users.flatMap(u =>
      (u.photos || []).filter(Boolean).map(url => ({
        url,
        user: u,
      }))
    );
  }, [users]);

  const allPhotosFiltered = useMemo(() => {
    if (!searchTerm.trim()) return allPhotos;
    const term = searchTerm.toLowerCase();
    return allPhotos.filter(
      p =>
        p.user.full_name?.toLowerCase().includes(term) ||
        p.user.user_id?.toLowerCase().includes(term) ||
        p.user.occupation_title?.toLowerCase().includes(term)
    );
  }, [allPhotos, searchTerm]);

  const counts = useMemo(() => {
    const total = users.length;
    const verified = users.filter(u => u.verified).length;
    const deletions = users.filter(u => u.deletion_requested).length;
    const suspended = users.filter(u => u.deactivated_at && !u.deletion_requested).length;
    const active = users.filter(u => !u.deletion_requested && !u.deactivated_at && u.is_public).length;
    const photos = allPhotos.length;
    return { total, active, suspended, deletions, verified, photos };
  }, [users, allPhotos]);

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

  const performProfileUpdate = async (user: Profile, updates: Record<string, any>) => {
    const uid = user.user_id;
    const pid = user.id;

    // 1. Try Vercel serverless function
    try {
      const res = await fetch('/api/admin-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'BlackLoveAdmin2026!',
        },
        body: JSON.stringify({
          action: 'update_profile',
          userId: uid,
          profileId: pid,
          updates,
          adminKey: 'BlackLoveAdmin2026!',
        }),
      });
      if (res.ok) {
        const body = await res.json();
        if (body.success) return body.data;
      }
    } catch (e) {
      console.warn('Serverless update failed, trying RPC fallback:', e);
    }

    // 2. Try Supabase RPC fallback
    try {
      const { data: rpcRes, error: rpcErr } = await (supabase as any).rpc('admin_update_profile', {
        target_user_id: uid,
        updates,
        admin_token: 'BlackLoveAdmin2026!',
      });
      if (!rpcErr && rpcRes) return rpcRes;
    } catch (e) {
      console.warn('RPC update failed, trying direct fallback:', e);
    }

    // 3. Fallback to direct client
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .or(`id.eq.${pid},user_id.eq.${uid}`)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No user profile was found to update.');
    return data;
  };

  // Action: Suspend
  const handleConfirmSuspend = async () => {
    if (!userToSuspend) return;
    setIsProcessing(true);
    try {
      await performProfileUpdate(userToSuspend, {
        is_public: false,
        deactivated_at: new Date().toISOString(),
        leave_reason: suspendReason.trim() || 'Suspended by administrator',
        deletion_requested: false,
      });

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
      await performProfileUpdate(user, {
        is_public: true,
        deactivated_at: null,
        scheduled_deletion_at: null,
        leave_reason: null,
        leave_feedback: null,
        deletion_requested: false,
      });

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
      await performProfileUpdate(user, { verified: !user.verified });

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

      let deletedSuccess = false;

      // 1. Try Vercel Serverless Function /api/admin-action
      try {
        const res = await fetch('/api/admin-action', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-key': 'BlackLoveAdmin2026!',
          },
          body: JSON.stringify({
            action: 'delete_user',
            userId: uid,
            profileId: pid,
            adminKey: 'BlackLoveAdmin2026!',
          }),
        });
        if (res.ok) {
          const body = await res.json();
          if (body.success) deletedSuccess = true;
        }
      } catch (e) {
        console.warn('Serverless delete endpoint failed, trying RPC fallback:', e);
      }

      // 2. Try Supabase RPC fallback
      if (!deletedSuccess) {
        try {
          const { data: rpcRes, error: rpcErr } = await (supabase as any).rpc('admin_delete_user', {
            target_user_id: uid,
            admin_token: 'BlackLoveAdmin2026!',
          });
          if (!rpcErr && rpcRes === true) {
            deletedSuccess = true;
          }
        } catch (e) {
          console.warn('RPC delete fallback failed:', e);
        }
      }

      // 3. Fallback to client-side direct deletion
      if (!deletedSuccess) {
        // Matches & messages
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

        // Swipes
        try {
          await supabase.from('swipes').delete().or(`swiper_id.eq.${uid},swiped_id.eq.${uid}`);
        } catch (err) {
          console.warn('Could not delete swipes:', err);
        }

        // Storage
        try {
          const { data: files } = await supabase.storage.from('profile-photos').list(uid);
          if (files && files.length > 0) {
            const filePaths = files.map((f: any) => `${uid}/${f.name}`);
            await supabase.storage.from('profile-photos').remove(filePaths);
          }
        } catch (err) {
          console.warn('Could not remove storage files:', err);
        }

        // Delete profile row
        const { data: deleted, error } = await supabase
          .from('profiles')
          .delete()
          .or(`id.eq.${pid},user_id.eq.${uid}`)
          .select();

        if (error) throw error;
        if (deleted && deleted.length > 0) {
          deletedSuccess = true;
        }
      }

      if (!deletedSuccess) {
        throw new Error(
          'Could not delete user. Please ensure the serverless function is deployed or run 20260928_admin_functions.sql in your Supabase SQL editor.'
        );
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

  // Action: Remove specific or multiple selected photos & notify
  const handleConfirmPhotoRemoval = async () => {
    if (!photosToRemove || photosToRemove.length === 0) return;
    setIsPhotoRemoving(true);
    try {
      // Group by user
      const userMap = new Map<string, { user: Profile; urls: string[] }>();
      for (const item of photosToRemove) {
        const u = item.user;
        if (!userMap.has(u.id)) {
          userMap.set(u.id, { user: u, urls: [] });
        }
        userMap.get(u.id)!.urls.push(item.url);
      }

      for (const { user, urls } of userMap.values()) {
        const removeSet = new Set(urls);
        const currentPhotos = (user.photos || []).filter(Boolean) as string[];
        const newPhotos = currentPhotos.filter(p => !removeSet.has(p));

        const updates: Record<string, any> = { photos: newPhotos };
        if (removeSet.has(user.avatar_url || '')) {
          updates.avatar_url = newPhotos[0] || null;
        }

        await performProfileUpdate(user, updates);

        // Clean storage for each photo
        for (const url of urls) {
          try {
            const marker = '/object/public/profile-photos/';
            const urlObj = new URL(url);
            const markerIdx = urlObj.pathname.indexOf(marker);
            if (markerIdx !== -1) {
              const filePath = decodeURIComponent(urlObj.pathname.slice(markerIdx + marker.length));
              await supabase.storage.from('profile-photos').remove([filePath]);
            }
          } catch (e) {
            console.warn('Storage cleanup error:', e);
          }
        }

        // Notify user
        try {
          await (supabase as any).from('admin_notifications').insert({
            user_id: user.user_id,
            type: 'admin',
            message: removalNote || DEFAULT_REMOVAL_MESSAGE(user.full_name || 'Member'),
            read: false,
          });
        } catch (e) {
          console.warn('Admin notification error:', e);
        }

        // Update selectedUser if matching
        setSelectedUser(prev => {
          if (!prev || (prev.id !== user.id && prev.user_id !== user.user_id)) return prev;
          return {
            ...prev,
            photos: newPhotos,
            avatar_url: removeSet.has(prev.avatar_url || '') ? (newPhotos[0] || null) : prev.avatar_url,
          };
        });

        // Update users list
        setUsers(prev => prev.map(u => {
          if (u.id !== user.id && u.user_id !== user.user_id) return u;
          return {
            ...u,
            photos: newPhotos,
            avatar_url: removeSet.has(u.avatar_url || '') ? (newPhotos[0] || null) : u.avatar_url,
          };
        }));
      }

      toast.success(`Removed ${photosToRemove.length} photo(s) and notified user(s).`);
      setPhotosToRemove(null);
      setSelectedUserPhotoUrls(new Set());
      setSelectedGlobalPhotoUrls(new Set());
      setRemovalNote('');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to remove photos.');
    } finally {
      setIsPhotoRemoving(false);
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
            { id: 'photos', label: 'Photo Moderation', count: counts.photos },
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

      {/* ── Photo Moderation View or Users Table ── */}
      {activeTab === 'photos' ? (
        <div className="bg-card border border-border rounded-3xl p-6 shadow-card space-y-6">
          {/* Header & Batch Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Images className="w-5 h-5 text-secondary" />
                Uploaded Photos Gallery ({allPhotosFiltered.length})
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click any photo to select it, or use the red trash icon to delete immediately.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {allPhotosFiltered.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (selectedGlobalPhotoUrls.size === allPhotosFiltered.length) {
                      setSelectedGlobalPhotoUrls(new Set());
                    } else {
                      setSelectedGlobalPhotoUrls(new Set(allPhotosFiltered.map(p => p.url)));
                    }
                  }}
                  className="text-xs px-3.5 py-2 rounded-xl border border-border bg-muted/60 hover:bg-muted text-foreground font-semibold transition-colors"
                >
                  {selectedGlobalPhotoUrls.size === allPhotosFiltered.length ? 'Deselect All' : 'Select All'}
                </button>
              )}

              {selectedGlobalPhotoUrls.size > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const toRemove = allPhotos.filter(p => selectedGlobalPhotoUrls.has(p.url));
                    setPhotosToRemove(toRemove);
                    setRemovalNote(POLICY_REASONS[0].message(toRemove[0]?.user.full_name || 'Member'));
                  }}
                  className="flex items-center gap-2 text-xs px-4 py-2 rounded-xl bg-destructive text-white font-bold shadow-lg hover:bg-destructive/90 transition-all animate-pulse"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected ({selectedGlobalPhotoUrls.size})
                </button>
              )}
            </div>
          </div>

          {allPhotosFiltered.length === 0 ? (
            <div className="py-20 text-center">
              <ImageOff className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="font-bold text-foreground text-base">No photos found</p>
              <p className="text-xs text-muted-foreground mt-1">Try clearing your search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {allPhotosFiltered.map((item, idx) => {
                const isSelected = selectedGlobalPhotoUrls.has(item.url);
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedGlobalPhotoUrls(prev => {
                        const next = new Set(prev);
                        if (next.has(item.url)) next.delete(item.url);
                        else next.add(item.url);
                        return next;
                      });
                    }}
                    className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all cursor-pointer group bg-muted shadow-sm hover:shadow-md ${
                      isSelected
                        ? 'border-destructive ring-2 ring-destructive/40'
                        : 'border-border hover:border-secondary/40'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.user.full_name}
                      className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${
                        isSelected ? 'brightness-90' : ''
                      }`}
                      loading="lazy"
                    />

                    {/* Selection Checkbox (Top-Left) */}
                    <div
                      className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-destructive text-white shadow-md'
                          : 'bg-black/55 backdrop-blur-sm border border-white/40 text-white/70 hover:bg-black/80'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-sm border border-white/60" />
                      )}
                    </div>

                    {/* Direct Red Trash Button (Top-Right) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotosToRemove([item]);
                        setRemovalNote(POLICY_REASONS[0].message(item.user.full_name || 'Member'));
                      }}
                      className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-destructive text-white shadow-lg hover:bg-destructive/90 hover:scale-110 active:scale-95 transition-all"
                      title="Delete this photo directly"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* User bar at bottom */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2.5 pt-6 text-white flex flex-col justify-end">
                      <p className="text-xs font-bold truncate">{item.user.full_name || 'Unnamed'}</p>
                      <div className="flex items-center justify-between text-[10px] text-white/75 mt-0.5">
                        <span>{item.user.age ? `${item.user.age} yrs` : 'Member'}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(item.user);
                          }}
                          className="hover:underline text-secondary font-semibold"
                        >
                          Profile ↗
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
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
      )}

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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Uploaded Photos ({selectedUser.photos?.filter(Boolean).length || 0})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Select specific photos to delete, or click the trash icon on any photo
                    </p>
                  </div>

                  {selectedUser.photos && selectedUser.photos.filter(Boolean).length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const validPhotos = (selectedUser.photos || []).filter(Boolean);
                          if (selectedUserPhotoUrls.size === validPhotos.length) {
                            setSelectedUserPhotoUrls(new Set());
                          } else {
                            setSelectedUserPhotoUrls(new Set(validPhotos));
                          }
                        }}
                        className="text-xs px-3 py-1.5 rounded-lg border border-border bg-muted/60 hover:bg-muted text-foreground font-medium transition-colors"
                      >
                        {selectedUserPhotoUrls.size === (selectedUser.photos?.filter(Boolean).length || 0)
                          ? 'Deselect All'
                          : 'Select All'}
                      </button>

                      {selectedUserPhotoUrls.size > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const toRemove = Array.from(selectedUserPhotoUrls).map(url => ({
                              url,
                              user: selectedUser,
                            }));
                            setPhotosToRemove(toRemove);
                            setRemovalNote(POLICY_REASONS[0].message(selectedUser.full_name || 'Member'));
                          }}
                          className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg bg-destructive text-white font-bold shadow-md hover:bg-destructive/90 transition-all animate-pulse"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Selected ({selectedUserPhotoUrls.size})
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {selectedUser.photos && selectedUser.photos.filter(Boolean).length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {selectedUser.photos.filter(Boolean).map((photoUrl, i) => {
                      const isSelected = selectedUserPhotoUrls.has(photoUrl);
                      return (
                        <div
                          key={i}
                          onClick={() => {
                            setSelectedUserPhotoUrls(prev => {
                              const next = new Set(prev);
                              if (next.has(photoUrl)) next.delete(photoUrl);
                              else next.add(photoUrl);
                              return next;
                            });
                          }}
                          className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer group bg-muted shadow-sm hover:shadow-md ${
                            isSelected
                              ? 'border-destructive ring-2 ring-destructive/40 shadow-destructive/20'
                              : 'border-border hover:border-secondary/40'
                          }`}
                        >
                          <img
                            src={photoUrl}
                            alt={`Photo ${i + 1}`}
                            className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${
                              isSelected ? 'brightness-90' : ''
                            }`}
                          />

                          {/* Checkbox (Top-Left) */}
                          <div
                            className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-destructive text-white shadow-md'
                                : 'bg-black/55 backdrop-blur-sm border border-white/40 text-white/70 hover:bg-black/80'
                            }`}
                          >
                            {isSelected ? (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            ) : (
                              <span className="w-2.5 h-2.5 rounded-sm border border-white/60" />
                            )}
                          </div>

                          {/* Always-visible Red Trash Button in top right */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPhotosToRemove([{ url: photoUrl, user: selectedUser }]);
                              setRemovalNote(POLICY_REASONS[0].message(selectedUser.full_name || 'Member'));
                            }}
                            className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-destructive text-white shadow-lg hover:bg-destructive/90 hover:scale-110 active:scale-95 transition-all"
                            title="Delete this photo directly"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Bottom bar with status & View link */}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2 flex items-center justify-between text-white text-[10px]">
                            <span className={isSelected ? 'text-destructive-foreground font-bold' : 'text-white/80'}>
                              {isSelected ? 'Selected' : 'Click to select'}
                            </span>
                            <a
                              href={photoUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="hover:underline text-white/90"
                            >
                              View ↗
                            </a>
                          </div>

                          {i === 0 && (
                            <span className="absolute bottom-7 left-2 text-[9px] font-bold uppercase tracking-widest bg-black/80 text-white px-2 py-0.5 rounded-full border border-white/20">
                              Avatar
                            </span>
                          )}
                        </div>
                      );
                    })}
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

      {/* ── MODAL 4: PHOTO REMOVAL CONFIRMATION ── */}
      <AnimatePresence>
        {photosToRemove && photosToRemove.length > 0 && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-card border border-destructive/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-destructive/15 flex items-center justify-center text-destructive flex-shrink-0">
                  <ImageOff className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Delete {photosToRemove.length} Photo{photosToRemove.length === 1 ? '' : 's'} & Notify User
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {photosToRemove.length === 1
                      ? `This photo will be removed from ${photosToRemove[0].user.full_name}'s profile and storage.`
                      : `These ${photosToRemove.length} photos will be removed from user profile(s) and storage.`}
                  </p>
                </div>
              </div>

              {/* Photo preview(s) */}
              <div className="py-2">
                {photosToRemove.length === 1 ? (
                  <div className="flex justify-center">
                    <div className="relative">
                      <img
                        src={photosToRemove[0].url}
                        alt="Photo to delete"
                        className="w-36 h-36 rounded-2xl object-cover border-2 border-destructive shadow-lg"
                      />
                      <span className="absolute top-2 right-2 bg-destructive text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                        Policy Violation
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-2 bg-muted/30 rounded-2xl border border-border">
                    {photosToRemove.map((item, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border-2 border-destructive shadow-sm">
                        <img src={item.url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 inset-x-1 truncate bg-black/80 text-[9px] text-white font-medium px-1 rounded text-center">
                          {item.user.full_name?.split(' ')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Policy Reason Pills */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Select Reason (Auto-fills Message):</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {POLICY_REASONS.map((reason, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRemovalNote(reason.message(photosToRemove[0]?.user.full_name || 'Member'))}
                      className="text-left p-2 rounded-xl border border-border hover:border-secondary hover:bg-secondary/10 text-[11px] font-medium transition-colors"
                    >
                      {reason.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable notification message */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  In-app note sent to {photosToRemove[0]?.user.full_name}:
                </label>
                <textarea
                  value={removalNote}
                  onChange={e => setRemovalNote(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground outline-none focus:border-secondary resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-2.5 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => { setPhotosToRemove(null); setRemovalNote(''); }}
                  disabled={isPhotoRemoving}
                  className="flex-1 py-2.5 rounded-xl bg-muted text-foreground text-xs font-bold hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPhotoRemoval}
                  disabled={isPhotoRemoving}
                  className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold hover:bg-destructive/90 transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-destructive/25"
                >
                  {isPhotoRemoving
                    ? 'Deleting & Notifying…'
                    : `Delete ${photosToRemove.length} Photo${photosToRemove.length === 1 ? '' : 's'} & Notify`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
