import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Mail, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

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

  const fetchTickets = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

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
      const { error } = await (supabase as any)
        .from('support_tickets')
        .update({ status: 'resolved' })
        .eq('id', id);

      if (error) throw error;
      
      toast.success("Ticket marked as resolved");
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
    } catch (err) {
      console.error("Error resolving ticket:", err);
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-black text-foreground">Messages</h1>
        <p className="text-muted-foreground mt-1">Support tickets and contact inquiries.</p>
      </div>

      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="bg-card border border-border p-12 text-center rounded-3xl">
            <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold">No messages yet</h3>
            <p className="text-muted-foreground">You're all caught up!</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="bg-card border border-border p-6 rounded-3xl shadow-sm flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md ${
                    ticket.status === 'resolved' 
                      ? 'bg-emerald-500/10 text-emerald-500' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {ticket.status}
                  </span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-1">{ticket.subject}</h3>
                <p className="text-sm font-medium text-foreground/80 mb-4">
                  From: {ticket.sender_name} ({ticket.sender_email})
                </p>
                
                <div className="bg-muted p-4 rounded-2xl text-foreground/90 whitespace-pre-wrap text-sm leading-relaxed">
                  {ticket.message}
                </div>
              </div>

              <div className="shrink-0 flex gap-3 pt-2">
                <a 
                  href={`mailto:${ticket.sender_email}?subject=RE: ${ticket.subject}`}
                  className="px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
                >
                  Reply via Email
                </a>
                {ticket.status !== 'resolved' && (
                  <button
                    onClick={() => markResolved(ticket.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-button hover:opacity-90 transition-opacity"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminMessagesPage;
