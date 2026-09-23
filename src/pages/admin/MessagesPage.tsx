import { useEffect, useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { Mail, CheckCircle, Clock, RefreshCw, Reply, Inbox, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { adminSupabase } from "@/services/adminService";

interface Ticket {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const AdminMessagesPage = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await (adminSupabase as any)
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const markResolved = async (id: string) => {
    try {
      const { error } = await (adminSupabase as any)
        .from("support_tickets")
        .update({ status: "resolved" })
        .eq("id", id);

      if (error) throw error;

      toast.success("Inquiry marked as resolved.");
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "resolved" } : t))
      );
    } catch (err) {
      console.error("Error resolving ticket:", err);
      toast.error("Failed to update status");
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === "pending") return t.status !== "resolved";
    if (filter === "resolved") return t.status === "resolved";
    return true;
  });

  const pendingCount = tickets.filter((t) => t.status !== "resolved").length;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Support Inquiries
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Member communications, contact requests, and support tickets.
          </p>
        </div>

        <button
          onClick={fetchTickets}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground hover:bg-muted text-sm font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-secondary" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-card border border-border rounded-2xl w-fit">
        {[
          { id: "all", label: "All Messages", count: tickets.length },
          { id: "pending", label: "Needs Action", count: pendingCount, alert: pendingCount > 0 },
          { id: "resolved", label: "Resolved", count: tickets.length - pendingCount },
        ].map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
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

      {/* Messages List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 bg-card border border-border rounded-3xl">
            <div className="w-8 h-8 border-3 border-secondary/20 border-t-secondary rounded-full animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Loading support inquiries…</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-card border border-border p-16 text-center rounded-3xl space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary mx-auto">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Inbox is Clear</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {filter === "pending"
                ? "No pending support tickets waiting for reply. Excellent work!"
                : "No inquiries found matching this view."}
            </p>
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const isResolved = ticket.status === "resolved";
            return (
              <div
                key={ticket.id}
                className="bg-card border border-border hover:border-secondary/30 p-6 rounded-3xl shadow-card transition-all duration-200 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg ${
                        isResolved
                          ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                          : "bg-destructive/15 text-destructive border border-destructive/30"
                      }`}
                    >
                      {isResolved ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" /> Action Required
                        </>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {ticket.created_at
                        ? format(new Date(ticket.created_at), "PPp")
                        : "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${ticket.sender_email}?subject=RE: ${encodeURIComponent(ticket.subject || "BlackLoveLink Inquiry")}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-muted text-foreground text-xs font-semibold hover:bg-muted/80 transition-colors"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      Reply via Email
                    </a>
                    {!isResolved && (
                      <button
                        onClick={() => markResolved(ticket.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl gradient-brand text-white text-xs font-bold shadow-button hover:opacity-90 transition-opacity"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Resolve
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-foreground">
                    {ticket.subject || "General Inquiry"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    From: <span className="font-semibold text-foreground">{ticket.sender_name || "Anonymous"}</span>{" "}
                    ({ticket.sender_email || "no-reply"})
                  </p>
                </div>

                <div className="bg-muted/40 p-4 rounded-2xl border border-border/60 text-foreground/90 whitespace-pre-wrap text-sm leading-relaxed font-sans">
                  {ticket.message}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminMessagesPage;
