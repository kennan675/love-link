import { useEffect, useState, useMemo } from "react";
import {
  Shield, ShieldAlert, ShieldCheck, UserX, Search,
  RefreshCw, Trash2, CheckCircle2, AlertTriangle, Eye,
  PauseCircle, PlayCircle, X, ExternalLink, Calendar,
  Briefcase, Heart, Sparkles, AlertOctagon, UserCheck
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { adminService, type AdminProfile } from "@/services/adminService";
import { motion, AnimatePresence } from "framer-motion";

type TabFilter = "all" | "active" | "suspended" | "deletions" | "verified";

const AdminUsersPage = () => {
  const [users, setUsers] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabFilter>("all");

  // Modals state
  const [selectedUser, setSelectedUser] = useState<AdminProfile | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminProfile | null>(null);
  const [userToSuspend, setUserToSuspend] = useState<AdminProfile | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.fetchProfiles();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to load users. Please check your admin connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Compute counts
  const counts = useMemo(() => {
    const total = users.length;
    const verified = users.filter((u) => u.verified).length;
    const deletions = users.filter((u) => u.deletion_requested).length;
    const suspended = users.filter(
      (u) => u.deactivated_at && !u.deletion_requested
    ).length;
    const active = users.filter(
      (u) => !u.deletion_requested && !u.deactivated_at && u.is_public
    ).length;

    return { total, active, suspended, deletions, verified };
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Tab filter
      if (activeTab === "active") {
        if (u.deletion_requested || u.deactivated_at || !u.is_public) return false;
      } else if (activeTab === "suspended") {
        if (!u.deactivated_at || u.deletion_requested) return false;
      } else if (activeTab === "deletions") {
        if (!u.deletion_requested) return false;
      } else if (activeTab === "verified") {
        if (!u.verified) return false;
      }

      // Search term
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const nameMatch = u.full_name?.toLowerCase().includes(term);
      const titleMatch = u.occupation_title?.toLowerCase().includes(term);
      const companyMatch = u.occupation_company?.toLowerCase().includes(term);
      const idMatch = u.user_id?.toLowerCase().includes(term);
      const genderMatch = u.gender?.toLowerCase().includes(term);
      return nameMatch || titleMatch || companyMatch || idMatch || genderMatch;
    });
  }, [users, activeTab, searchTerm]);

  // Action: Suspend User
  const handleConfirmSuspend = async () => {
    if (!userToSuspend) return;
    setIsProcessing(true);
    try {
      await adminService.suspendUser(
        userToSuspend.user_id,
        suspendReason.trim() || "Suspended by administrator"
      );
      toast.success(`Account for ${userToSuspend.full_name} has been suspended.`);
      setUserToSuspend(null);
      setSuspendReason("");
      await loadUsers();
    } catch (e) {
      console.error(e);
      toast.error("Failed to suspend user.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Action: Reactivate User
  const handleReactivate = async (user: AdminProfile) => {
    setIsProcessing(true);
    try {
      await adminService.reactivateUser(user.user_id);
      toast.success(`Account for ${user.full_name} has been restored & reactivated.`);
      await loadUsers();
    } catch (e) {
      console.error(e);
      toast.error("Failed to reactivate user.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Action: Toggle Verified
  const handleToggleVerified = async (user: AdminProfile) => {
    try {
      await adminService.toggleVerification(user.user_id, !user.verified);
      toast.success(
        `${user.full_name} is now ${!user.verified ? "Verified" : "Unverified"}.`
      );
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === user.user_id ? { ...u, verified: !user.verified } : u
        )
      );
    } catch (e) {
      console.error(e);
      toast.error("Failed to update verification status.");
    }
  };

  // Action: Delete User
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsProcessing(true);
    try {
      await adminService.deleteUser(userToDelete.user_id);
      toast.success(`Account for ${userToDelete.full_name} has been permanently deleted.`);
      setUserToDelete(null);
      setUsers((prev) => prev.filter((u) => u.user_id !== userToDelete.user_id));
      if (selectedUser?.user_id === userToDelete.user_id) setSelectedUser(null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete user account.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            User Accounts
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Comprehensive account management, suspensions, deletion tracking, and verifications.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={loadUsers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground hover:bg-muted text-sm font-semibold transition-all disabled:opacity-50"
            title="Refresh user list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-secondary" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Filter Tabs & Search Bar ── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-card border border-border rounded-2xl overflow-x-auto scrollbar-none">
          {[
            { id: "all", label: "All Users", count: counts.total },
            { id: "active", label: "Active", count: counts.active },
            { id: "suspended", label: "Suspended", count: counts.suspended },
            {
              id: "deletions",
              label: "Self-Deleted / Pending",
              count: counts.deletions,
              alert: counts.deletions > 0,
            },
            { id: "verified", label: "Verified", count: counts.verified },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabFilter)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "gradient-brand text-white shadow-button"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-black leading-none ${
                    isActive
                      ? "bg-white/25 text-white"
                      : tab.alert
                      ? "bg-destructive/15 text-destructive border border-destructive/30"
                      : "bg-muted text-foreground/80"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, job, gender, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-secondary focus:ring-1 focus:ring-secondary/40 outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Users Table ── */}
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
                    <p className="text-sm font-medium text-muted-foreground">Loading members…</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                      <UserX className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-foreground text-base">No accounts found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchTerm ? `No users matching "${searchTerm}"` : "No accounts match this filter"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSelfDeleted = user.deletion_requested;
                  const isSuspended = !isSelfDeleted && Boolean(user.deactivated_at);
                  const isActive = !isSelfDeleted && !isSuspended && user.is_public;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-muted/30 transition-colors duration-150 group"
                    >
                      {/* Member Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          {/* Avatar */}
                          <div className="relative w-11 h-11 rounded-2xl bg-muted overflow-hidden shrink-0 border border-border/80 shadow-xs">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full gradient-brand opacity-60 flex items-center justify-center text-white font-bold text-base">
                                {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                              </div>
                            )}
                            {user.verified && (
                              <span className="absolute bottom-0 right-0 p-0.5 bg-secondary text-secondary-foreground rounded-tl-lg shadow-xs">
                                <CheckCircle2 className="w-3 h-3 text-background" />
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground truncate text-sm sm:text-base">
                                {user.full_name || "Unnamed User"}
                              </span>
                              {user.is_admin && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-black bg-secondary/15 text-secondary border border-secondary/30">
                                  Admin
                                </span>
                              )}
                            </div>
                            <div
                              className="text-xs text-muted-foreground/80 font-mono truncate max-w-[180px]"
                              title={user.user_id}
                            >
                              {user.user_id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Demographics */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground text-xs sm:text-sm">
                          {user.age ? `${user.age} yrs` : "Age N/A"} • {user.gender || "Not specified"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {user.dob ? `DOB: ${user.dob}` : "No DOB"}
                        </div>
                      </td>

                      {/* Career & Intent */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground text-xs sm:text-sm truncate max-w-[200px]">
                          {user.occupation_title || user.occupation_company ? (
                            <span>
                              {user.occupation_title || "Role"}
                              {user.occupation_company ? ` at ${user.occupation_company}` : ""}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic">Career not specified</span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-secondary mt-0.5 truncate max-w-[200px]">
                          {user.intent || "No intent set"}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {isSelfDeleted ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-destructive/15 text-destructive border border-destructive/30 font-bold text-xs">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Deletion Requested
                            </span>
                            {user.scheduled_deletion_at && (
                              <p className="text-[11px] text-muted-foreground">
                                Scheduled: {format(new Date(user.scheduled_deletion_at), "MMM d, yyyy")}
                              </p>
                            )}
                            {user.leave_reason && (
                              <p className="text-[11px] text-muted-foreground italic truncate max-w-[180px]" title={user.leave_reason}>
                                Reason: "{user.leave_reason}"
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

                      {/* Joined Date */}
                      <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                        {user.created_at
                          ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true })
                          : "N/A"}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Profile */}
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="View Full Profile Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Toggle Verified */}
                          <button
                            onClick={() => handleToggleVerified(user)}
                            className={`p-2 rounded-xl transition-colors ${
                              user.verified
                                ? "text-secondary hover:bg-secondary/10"
                                : "text-muted-foreground hover:text-secondary hover:bg-muted"
                            }`}
                            title={user.verified ? "Remove Verification Badge" : "Grant Verification Badge"}
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>

                          {/* Suspend or Reactivate */}
                          {isSelfDeleted || isSuspended ? (
                            <button
                              onClick={() => handleReactivate(user)}
                              className="p-2 rounded-xl text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                              title="Restore & Reactivate Account"
                            >
                              <PlayCircle className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setUserToSuspend(user)}
                              className="p-2 rounded-xl text-amber-500 hover:bg-amber-500/10 transition-colors"
                              title="Suspend User Account"
                            >
                              <PauseCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Permanent Delete */}
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

      {/* ── MODAL 1: VIEW FULL PROFILE DETAILS ── */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-muted overflow-hidden border border-border">
                    {selectedUser.avatar_url ? (
                      <img
                        src={selectedUser.avatar_url}
                        alt={selectedUser.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full gradient-brand opacity-60 flex items-center justify-center text-white font-black text-xl">
                        {selectedUser.full_name?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      {selectedUser.full_name || "Unnamed"}
                      {selectedUser.verified && (
                        <span className="p-0.5 bg-secondary text-secondary-foreground rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-muted-foreground font-mono">
                      ID: {selectedUser.user_id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Photos Gallery */}
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
                        <img
                          src={photoUrl}
                          alt={`User photo ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition-opacity">
                          View
                        </span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No photos uploaded.</p>
                )}
              </div>

              {/* Demographic Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 bg-muted/30 p-4 rounded-2xl border border-border/60 text-xs">
                <div>
                  <span className="text-muted-foreground block">Age & Gender</span>
                  <span className="font-bold text-foreground">
                    {selectedUser.age ? `${selectedUser.age} yrs` : "N/A"} • {selectedUser.gender || "Unspecified"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Date of Birth</span>
                  <span className="font-bold text-foreground">{selectedUser.dob || "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Relationship Intent</span>
                  <span className="font-bold text-secondary">{selectedUser.intent || "None specified"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Job Title</span>
                  <span className="font-bold text-foreground">{selectedUser.occupation_title || "None"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Company</span>
                  <span className="font-bold text-foreground">{selectedUser.occupation_company || "None"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Account Registered</span>
                  <span className="font-bold text-foreground">
                    {selectedUser.created_at ? format(new Date(selectedUser.created_at), "PP") : "N/A"}
                  </span>
                </div>
              </div>

              {/* Bio & Interests */}
              {selectedUser.bio && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Bio</p>
                  <p className="text-sm bg-muted/40 p-3 rounded-xl border border-border text-foreground leading-relaxed">
                    {selectedUser.bio}
                  </p>
                </div>
              )}

              {selectedUser.interests && selectedUser.interests.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Interests</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedUser.interests.map((interest, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-card border border-border text-foreground"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Deletion & Suspension Warnings */}
              {(selectedUser.deletion_requested || selectedUser.deactivated_at) && (
                <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 space-y-1.5 text-xs text-destructive">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    {selectedUser.deletion_requested ? "Account Deletion Requested" : "Account Suspended"}
                  </p>
                  {selectedUser.deactivated_at && (
                    <p>Deactivated at: {format(new Date(selectedUser.deactivated_at), "PPpp")}</p>
                  )}
                  {selectedUser.scheduled_deletion_at && (
                    <p>Scheduled permanent purge: {format(new Date(selectedUser.scheduled_deletion_at), "PPpp")}</p>
                  )}
                  {selectedUser.leave_reason && (
                    <p>Reason: "{selectedUser.leave_reason}"</p>
                  )}
                  {selectedUser.leave_feedback && (
                    <p>Feedback: "{selectedUser.leave_feedback}"</p>
                  )}
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <button
                  onClick={() => {
                    setUserToDelete(selectedUser);
                  }}
                  className="px-4 py-2 rounded-xl text-destructive hover:bg-destructive/10 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Permanently
                </button>

                <div className="flex gap-2">
                  {selectedUser.deletion_requested || selectedUser.deactivated_at ? (
                    <button
                      onClick={() => handleReactivate(selectedUser)}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-600 transition-colors"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Restore Account
                    </button>
                  ) : (
                    <button
                      onClick={() => setUserToSuspend(selectedUser)}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-amber-600 transition-colors"
                    >
                      <PauseCircle className="w-4 h-4" />
                      Suspend Account
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="px-4 py-2 rounded-xl bg-muted text-foreground font-semibold text-xs hover:bg-muted/80 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: SUSPEND CONFIRMATION ── */}
      <AnimatePresence>
        {userToSuspend && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-500 mx-auto">
                <PauseCircle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-foreground">
                  Suspend {userToSuspend.full_name}?
                </h3>
                <p className="text-xs text-muted-foreground">
                  The account will be hidden from matchmaking and feed recommendations immediately.
                </p>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-foreground">
                  Reason for Suspension (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Terms violation, inappropriate conduct..."
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground outline-none focus:border-secondary"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setUserToSuspend(null)}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 rounded-xl bg-muted text-foreground text-xs font-bold hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSuspend}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors flex items-center justify-center gap-1.5"
                >
                  {isProcessing ? "Suspending..." : "Confirm Suspension"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 3: DELETE CONFIRMATION ── */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-destructive/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center text-destructive mx-auto">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-foreground">
                  Permanently Delete {userToDelete.full_name}?
                </h3>
                <p className="text-xs text-destructive font-medium">
                  WARNING: This will permanently purge their profile, swipes, matches, messages, and uploaded photos. This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 rounded-xl bg-muted text-foreground text-xs font-bold hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold hover:bg-destructive/90 transition-colors flex items-center justify-center gap-1.5"
                >
                  {isProcessing ? "Deleting..." : "Delete Permanently"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsersPage;
