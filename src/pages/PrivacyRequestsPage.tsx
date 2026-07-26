import React, { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ClipboardList, Download, Trash2, ShieldOff, CheckCircle2,
  Clock, XCircle, AlertCircle, Mail, ExternalLink, RefreshCw,
} from "lucide-react";
import TopNav from "@/components/TopNav";
import { supabase } from "@/integrations/supabase/client";

// ── Types ─────────────────────────────────────────────────────────────────────
type RequestStatus =
  | "in_progress"
  | "ready"
  | "expired"
  | "denied"
  | "scheduled"
  | "complete"
  | "canceled"
  | "active";

type RequestType = "data_download" | "account_deletion" | "opt_out";

interface PrivacyRequest {
  id: string;
  type: RequestType;
  status: RequestStatus;
  timestamp: string;
  completedAt?: string;
}

const LS_REQUESTS_KEY = "bll_privacy_requests";

// ── Helpers ───────────────────────────────────────────────────────────────────
const getRequests = (): PrivacyRequest[] => {
  try {
    const raw = localStorage.getItem(LS_REQUESTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveRequests = (reqs: PrivacyRequest[]) => {
  try {
    localStorage.setItem(LS_REQUESTS_KEY, JSON.stringify(reqs));
  } catch {
    // ignore
  }
};

// ── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
  const config: Record<RequestStatus, { label: string; className: string }> = {
    in_progress: { label: "In Progress", className: "bg-amber-400/15 text-amber-700 dark:text-amber-400 border-amber-400/30" },
    ready:       { label: "Ready", className: "bg-emerald-400/15 text-emerald-700 dark:text-emerald-400 border-emerald-400/30" },
    expired:     { label: "Expired", className: "bg-muted text-muted-foreground border-border" },
    denied:      { label: "Denied", className: "bg-rose-400/15 text-rose-700 dark:text-rose-400 border-rose-400/30" },
    scheduled:   { label: "Scheduled", className: "bg-amber-400/15 text-amber-700 dark:text-amber-400 border-amber-400/30" },
    complete:    { label: "Complete", className: "bg-emerald-400/15 text-emerald-700 dark:text-emerald-400 border-emerald-400/30" },
    canceled:    { label: "Canceled", className: "bg-muted text-muted-foreground border-border" },
    active:      { label: "Active", className: "bg-emerald-400/15 text-emerald-700 dark:text-emerald-400 border-emerald-400/30" },
  };
  const c = config[status] ?? config.expired;
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${c.className}`}>
      {c.label}
    </span>
  );
};

const StatusIcon: React.FC<{ status: RequestStatus }> = ({ status }) => {
  if (status === "ready" || status === "complete" || status === "active")
    return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  if (status === "in_progress" || status === "scheduled")
    return <Clock className="w-4 h-4 text-amber-500" />;
  if (status === "denied")
    return <XCircle className="w-4 h-4 text-rose-500" />;
  return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
};

// ── Request Card ──────────────────────────────────────────────────────────────
const TypeLabel: Record<RequestType, string> = {
  data_download:    "Data Download",
  account_deletion: "Account Deletion",
  opt_out:          "Opt-Out of Sharing",
};

const TypeIcon: Record<RequestType, React.FC<{ className?: string }>> = {
  data_download:    Download,
  account_deletion: Trash2,
  opt_out:          ShieldOff,
};

const RequestCard: React.FC<{
  req: PrivacyRequest;
  onCancel?: (id: string) => void;
  onRequestAgain?: (id: string) => void;
  onDownload?: (req: PrivacyRequest) => void;
}> = ({ req, onCancel, onRequestAgain, onDownload }) => {
  const Icon = TypeIcon[req.type];
  const ts = new Date(req.timestamp);
  const now = Date.now();
  const withinCancelWindow =
    req.type === "account_deletion" &&
    req.status === "scheduled" &&
    now - ts.getTime() < 48 * 60 * 60 * 1000;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-foreground text-sm">{TypeLabel[req.type]}</p>
              <StatusIcon status={req.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Requested {ts.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </p>
          </div>
        </div>
        <StatusBadge status={req.status} />
      </div>
      <p className="text-sm text-foreground/70 leading-relaxed pl-12">
        {req.type === "data_download" && req.status === "in_progress" &&
          "We're preparing your data export. You'll receive an email when it's ready."}
        {req.type === "data_download" && req.status === "ready" &&
          "Your data export is ready! Download it before the link expires."}
        {req.type === "data_download" && req.status === "expired" &&
          "Your download link has expired. Request a new one below."}
        {req.type === "data_download" && req.status === "denied" &&
          "We were unable to process this request. Contact legal@blacklovelink.com."}
        {req.type === "account_deletion" && req.status === "scheduled" &&
          "Your account is scheduled for deletion. Profile is hidden. You can cancel within 48 hours."}
        {req.type === "account_deletion" && req.status === "complete" &&
          "Account deletion complete. All data has been purged."}
        {req.type === "account_deletion" && req.status === "canceled" &&
          "You cancelled this deletion request. Your account is fully restored."}
        {req.type === "opt_out" &&
          "You are opted out of cross-context ad sharing. Change your choice anytime."}
      </p>
      <div className="pl-12 flex flex-wrap gap-2">
        {req.type === "data_download" && req.status === "ready" && onDownload && (
          <button
            onClick={() => onDownload(req)}
            className="inline-flex items-center gap-1.5 rounded-full gradient-brand text-primary-foreground text-xs font-bold px-4 py-2 hover:opacity-90 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Download Data
          </button>
        )}
        {req.type === "data_download" && req.status === "expired" && onRequestAgain && (
          <button
            onClick={() => onRequestAgain(req.id)}
            className="inline-flex items-center gap-1.5 rounded-full bg-muted border border-border text-foreground text-xs font-bold px-4 py-2 hover:bg-accent transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Request Again
          </button>
        )}
        {withinCancelWindow && onCancel && (
          <button
            onClick={() => onCancel(req.id)}
            className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold px-4 py-2 hover:bg-rose-500/20 transition-all"
          >
            <XCircle className="w-3.5 h-3.5" /> Cancel Deletion
          </button>
        )}
        {req.type === "opt_out" && (
          <Link
            to="/privacy/do-not-share"
            className="inline-flex items-center gap-1.5 rounded-full bg-muted border border-border text-foreground text-xs font-bold px-4 py-2 hover:bg-accent transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Change Choice
          </Link>
        )}
      </div>
    </div>
  );
};

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast: React.FC<{ message: string; visible: boolean }> = ({ message, visible }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
    transition={{ duration: 0.3 }}
    className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background text-sm font-semibold px-6 py-3 rounded-full shadow-2xl pointer-events-none whitespace-nowrap"
  >
    {message}
  </motion.div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const PrivacyRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<PrivacyRequest[]>([]);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    setRequests(getRequests());
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  };

  const handleRequestDownload = () => {
    const existing = requests.find(
      (r) => r.type === "data_download" && (r.status === "in_progress" || r.status === "ready")
    );
    if (existing) {
      showToast("You already have an active data request.");
      return;
    }
    const reqId = `dr_${Date.now()}`;
    const newReq: PrivacyRequest = {
      id: reqId,
      type: "data_download",
      status: "in_progress",
      timestamp: new Date().toISOString(),
    };
    const updated = [newReq, ...requests];
    setRequests(updated);
    saveRequests(updated);
    showToast("Request submitted! We'll prepare your download.");

    // Simulate compilation delay of 4 seconds, then transition to ready
    setTimeout(() => {
      setRequests((currentRequests) => {
        const next = currentRequests.map((r) =>
          r.id === reqId ? { ...r, status: "ready" as RequestStatus } : r
        );
        saveRequests(next);
        return next;
      });
      showToast("Your data download is now ready!");
    }, 4000);
  };

  const handleDownloadFile = async (req: PrivacyRequest) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let exportData: any = {
        request_id: req.id,
        request_type: req.type,
        requested_timestamp: req.timestamp,
        fulfilled_timestamp: new Date().toISOString(),
        site: "BlackLoveLink",
      };

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        exportData.account = {
          user_id: session.user.id,
          email: session.user.email,
          phone: session.user.phone,
          created_at: session.user.created_at,
        };

        if (profile) {
          exportData.profile = {
            full_name: profile.full_name,
            occupation_title: profile.occupation_title,
            company: profile.company,
            dob: profile.dob,
            gender: profile.gender,
            intent: profile.intent,
            bio: profile.bio,
            interests: profile.interests,
            is_public: profile.is_public,
          };
        }
      } else {
        // Fallback mock export for unauthenticated demonstration
        exportData.profile = {
          full_name: "Mock User",
          occupation_title: "Product Manager",
          dob: "1994-05-12",
          intent: "Serious relationship",
          bio: "Just exploring my options and looking for something meaningful.",
          interests: ["Travel", "Photography", "Cooking"],
        };
      }

      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `blacklovelink_data_export_${req.id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("Data export downloaded successfully.");
    } catch (e) {
      showToast("Failed to compile export file.");
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from("profiles")
          .update({
            is_public: true,
            deactivated_at: null,
            scheduled_deletion_at: null,
            deletion_requested: false,
          })
          .eq("user_id", session.user.id);
      }

      const updated = requests.map((r) =>
        r.id === id ? { ...r, status: "canceled" as RequestStatus } : r
      );
      setRequests(updated);
      saveRequests(updated);
      showToast("Deletion canceled. Your account has been restored.");
    } catch (err) {
      showToast("Failed to restore account. Please contact legal@blacklovelink.com.");
    }
  };

  const handleRequestAgain = (id: string) => {
    const existing = requests.find(
      (r) => r.type === "data_download" && r.status === "in_progress"
    );
    if (existing) {
      showToast("You already have a pending data request.");
      return;
    }
    const newReq: PrivacyRequest = {
      id: `dr_${Date.now()}`,
      type: "data_download",
      status: "in_progress",
      timestamp: new Date().toISOString(),
    };
    const updated = [newReq, ...requests.map((r) => (r.id === id ? r : r))];
    setRequests(updated);
    saveRequests(updated);
    showToast("Request submitted! We'll email you when your data is ready.");
  };

  const activeRequests = requests.filter(
    (r) =>
      r.status === "in_progress" ||
      r.status === "ready" ||
      r.status === "scheduled" ||
      r.status === "active"
  );

  const historyRequests = requests
    .filter(
      (r) =>
        r.status === "complete" ||
        r.status === "expired" ||
        r.status === "denied" ||
        r.status === "canceled"
    )
    .slice(0, 5);

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay },
  });

  return (
    <div className="min-h-screen font-display bg-background text-foreground">
      <SEO
        title="My Privacy Requests | BlackLoveLink"
        description="Track your data access, deletion, and opt-out requests in your privacy dashboard."
        path="/privacy/requests"
        ogType="website"
      />
      <TopNav />

      <main className="max-w-2xl mx-auto px-4 pt-6 pb-32 md:pb-16 space-y-8">

        {/* ── Page Header ── */}
        <motion.div {...fadeUp()} className="space-y-1">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 -ml-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl font-black text-foreground">My Privacy Requests</h1>
          <p className="text-sm text-muted-foreground">
            Track your data access, deletion, and opt-out requests
          </p>
        </motion.div>

        {/* ── Active Requests ── */}
        <motion.section {...fadeUp(0.06)} className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-foreground/40">
            Active Requests
          </h2>
          <AnimatePresence>
            {activeRequests.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-3xl border border-border bg-card p-10 text-center space-y-4"
              >
                <div className="text-4xl">📋</div>
                <p className="font-bold text-foreground">No active requests</p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  When you request data or delete your account, you'll see the status here.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <button
                    onClick={handleRequestDownload}
                    className="inline-flex items-center justify-center gap-2 rounded-full gradient-brand text-primary-foreground text-sm font-bold px-6 py-3 hover:opacity-90 transition-all hover:scale-105"
                  >
                    <Download className="w-4 h-4" /> Request Data Download
                  </button>
                  <Link
                    to="/privacy/do-not-share"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-muted border border-border text-foreground text-sm font-bold px-6 py-3 hover:bg-accent transition-all"
                  >
                    <ShieldOff className="w-4 h-4" /> Do Not Share My Info
                  </Link>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {activeRequests.map((req) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                  >
                    <RequestCard
                      req={req}
                      onCancel={handleCancel}
                      onRequestAgain={handleRequestAgain}
                      onDownload={handleDownloadFile}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ── Request History ── */}
        <motion.section {...fadeUp(0.12)} className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-foreground/40">
            Request History
          </h2>
          {historyRequests.length === 0 ? (
            <div className="rounded-2xl border border-border bg-muted/30 p-6 text-center">
              <p className="text-sm text-muted-foreground">No completed requests yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyRequests.map((req) => (
                <RequestCard key={req.id} req={req} onDownload={handleDownloadFile} />
              ))}
            </div>
          )}
        </motion.section>

        {/* ── Action Buttons ── */}
        <motion.section {...fadeUp(0.18)} className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRequestDownload}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full gradient-brand text-primary-foreground text-sm font-bold px-6 py-3.5 hover:opacity-90 transition-all hover:scale-105"
          >
            <Download className="w-4 h-4" /> Request Data Download
          </button>
          <Link
            to="/privacy/do-not-share"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-muted border border-border text-foreground text-sm font-bold px-6 py-3.5 hover:bg-accent transition-all"
          >
            <ShieldOff className="w-4 h-4" /> Manage Privacy Settings
          </Link>
        </motion.section>

        {/* ── Footer ── */}
        <motion.div {...fadeUp(0.22)} className="rounded-2xl border border-border bg-muted/30 p-5 space-y-1 text-center">
          <p className="text-xs text-muted-foreground">
            We keep request records for <strong>24 months</strong> to comply with US state laws.
          </p>
          <p className="text-xs text-muted-foreground">
            Questions?{" "}
            <a
              href="mailto:legal@blacklovelink.com"
              className="text-primary underline inline-flex items-center gap-1"
            >
              <Mail className="w-3 h-3" />
              legal@blacklovelink.com
            </a>
          </p>
        </motion.div>

      </main>

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
};

export default PrivacyRequestsPage;
