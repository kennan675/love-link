import { useState, useRef, useEffect, useCallback } from "react";
import TopNav from "@/components/TopNav";
import {
  Search, Send, ArrowLeft, Heart, MessageCircle, Clock, CheckCircle,
  X, User, Wifi, WifiOff, Reply, Pencil, Trash2, Copy, Check, MoreVertical
} from "lucide-react";
import { useMatches, getProfilePhoto } from "@/hooks/useMatches";
import { useMessages, type Message } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type TabType = "chats" | "requests";

// ── Time helpers ──
const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
};

const shouldShowDateSeparator = (prev: Message | null, curr: Message): boolean => {
  if (!prev) return true;
  const prevDate = new Date(prev.created_at).toDateString();
  const currDate = new Date(curr.created_at).toDateString();
  return prevDate !== currDate;
};

// ── Context Menu Component ──
interface ContextMenuProps {
  x: number;
  y: number;
  isOwn: boolean;
  message: Message;
  onReply: () => void;
  onEdit: () => void;
  onUnsend: () => void;
  onCopy: () => void;
  onClose: () => void;
}

const MessageContextMenu = ({ x, y, isOwn, message, onReply, onEdit, onUnsend, onCopy, onClose }: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [onClose]);

  // Ensure menu stays within viewport
  const adjustedY = Math.min(y, window.innerHeight - 220);
  const adjustedX = isOwn ? Math.max(x - 180, 8) : Math.min(x, window.innerWidth - 188);

  if (message.deleted_at) return null;

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.12 }}
      className="fixed z-[100] w-44 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
      style={{ top: adjustedY, left: adjustedX }}
    >
      <button
        onClick={onReply}
        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
      >
        <Reply className="w-4 h-4 text-primary" /> Reply
      </button>
      <button
        onClick={onCopy}
        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
      >
        <Copy className="w-4 h-4 text-muted-foreground" /> Copy
      </button>
      {isOwn && (
        <>
          <button
            onClick={onEdit}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <Pencil className="w-4 h-4 text-blue-500" /> Edit
          </button>
          <button
            onClick={onUnsend}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Unsend
          </button>
        </>
      )}
    </motion.div>
  );
};

// ── Unsend Confirmation Dialog ──
const UnsendDialog = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm px-6"
    onClick={onCancel}
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      className="bg-card rounded-2xl p-6 max-w-xs w-full shadow-2xl border border-border"
      onClick={e => e.stopPropagation()}
    >
      <h3 className="text-lg font-bold text-foreground mb-2">Unsend Message?</h3>
      <p className="text-sm text-muted-foreground mb-5">
        This will remove the message for everyone in the chat.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white" onClick={onConfirm}>Unsend</Button>
      </div>
    </motion.div>
  </motion.div>
);

const MessagesPage = () => {
  const { matches, loading, refetch } = useMatches();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("chats");
  const [viewingProfile, setViewingProfile] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; message: Message } | null>(null);
  // Reply state
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  // Edit state
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editText, setEditText] = useState("");
  // Unsend dialog
  const [unsendTarget, setUnsendTarget] = useState<Message | null>(null);
  // Copied feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { messages, sendMessage, editMessage, unsendMessage, connected } = useMessages(selectedMatchId);

  const selectedMatch = matches.find((m) => m.id === selectedMatchId);
  const viewingMatch = matches.find((m) => m.id === viewingProfile);
  const inputRef = useRef<HTMLInputElement>(null);

  // Categorize matches
  const acceptedChats = matches.filter(m => m.status === "accepted");
  const pendingRequests = matches.filter(m => m.status === "pending_me");
  const sentRequests = matches.filter(m => m.status === "pending_them");
  const newMatches = matches.filter(m => m.status === "no_messages");

  const requestCount = pendingRequests.length;
  const totalUnread = matches.filter(m => m.hasUnread).length;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (editingMessage) inputRef.current?.focus();
  }, [editingMessage]);

  const handleSend = async () => {
    if (editingMessage) {
      // We are editing
      if (editText.trim() && editText.trim() !== editingMessage.content) {
        await editMessage(editingMessage.id, editText.trim());
      }
      setEditingMessage(null);
      setEditText("");
      setNewMessage("");
      return;
    }

    if (!newMessage.trim()) return;
    await sendMessage(newMessage.trim(), replyTo?.id);
    setNewMessage("");
    setReplyTo(null);
    setTimeout(() => refetch(), 600);
  };

  const handleAcceptRequest = (matchId: string) => {
    setSelectedMatchId(matchId);
    setViewingProfile(null);
  };

  // Context menu handlers
  const handleContextMenu = useCallback((e: React.MouseEvent | React.TouchEvent, msg: Message) => {
    e.preventDefault();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = "clientX" in e ? e.clientX : rect.left;
    const y = "clientY" in e ? e.clientY : rect.top;
    setContextMenu({ x, y, message: msg });
  }, []);

  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleTouchStart = useCallback((msg: Message) => (e: React.TouchEvent) => {
    longPressRef.current = setTimeout(() => {
      const touch = e.touches[0];
      setContextMenu({ x: touch.clientX, y: touch.clientY, message: msg });
    }, 500);
  }, []);
  const handleTouchEnd = useCallback(() => {
    if (longPressRef.current) clearTimeout(longPressRef.current);
  }, []);

  const handleReply = () => {
    if (contextMenu) setReplyTo(contextMenu.message);
    setContextMenu(null);
    inputRef.current?.focus();
  };

  const handleStartEdit = () => {
    if (contextMenu) {
      setEditingMessage(contextMenu.message);
      setEditText(contextMenu.message.content);
      setNewMessage(contextMenu.message.content);
    }
    setContextMenu(null);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText("");
    setNewMessage("");
  };

  const handleStartUnsend = () => {
    if (contextMenu) setUnsendTarget(contextMenu.message);
    setContextMenu(null);
  };

  const handleConfirmUnsend = async () => {
    if (unsendTarget) await unsendMessage(unsendTarget.id);
    setUnsendTarget(null);
  };

  const handleCopy = () => {
    if (contextMenu) {
      navigator.clipboard.writeText(contextMenu.message.content);
      setCopiedId(contextMenu.message.id);
      setTimeout(() => setCopiedId(null), 1500);
    }
    setContextMenu(null);
  };

  // Find the reply-to message for a given message
  const getReplyMessage = (msg: Message): Message | undefined =>
    msg.reply_to ? messages.find(m => m.id === msg.reply_to) : undefined;

  const filteredAccepted = acceptedChats.filter((m) =>
    m.matchedProfile.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = pendingRequests.filter((m) =>
    m.matchedProfile.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Profile view modal ──────────────────────────────────────────────
  if (viewingProfile && viewingMatch) {
    const profile = viewingMatch.matchedProfile;
    return (
      <div className="flex h-[100dvh] flex-col bg-background">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <button onClick={() => setViewingProfile(null)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-foreground">View Profile</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="relative">
            <img
              src={getProfilePhoto(profile)}
              alt={profile.full_name}
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl font-bold text-white">
                {profile.full_name}, {profile.age || "—"}
              </h2>
              <p className="text-white/80 text-sm">
                {profile.occupation_title} {profile.occupation_company && `at ${profile.occupation_company}`}
              </p>
              {profile.verified && (
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-primary/20 rounded-full text-xs text-primary">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
          </div>

          <div className="p-4 space-y-4">
            {profile.intent && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Looking for</h4>
                <p className="text-foreground">{profile.intent}</p>
              </div>
            )}
            {profile.bio && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">About</h4>
                <p className="text-foreground text-sm">{profile.bio}</p>
              </div>
            )}
            {profile.interests && profile.interests.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest: string) => (
                    <span key={interest} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {viewingMatch.lastMessage && (
              <div className="mt-6 p-4 bg-card rounded-xl border border-border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Their Message</h4>
                <p className="text-foreground">"{viewingMatch.lastMessage}"</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border p-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setViewingProfile(null)}>
            <X className="w-4 h-4 mr-2" /> Decline
          </Button>
          <Button
            className="flex-1 gradient-brand text-primary-foreground"
            onClick={() => handleAcceptRequest(viewingProfile)}
          >
            <MessageCircle className="w-4 h-4 mr-2" /> Accept & Reply
          </Button>
        </div>
      </div>
    );
  }

  // ── Chat view ────────────────────────────────────────────────────────
  if (selectedMatchId && selectedMatch) {
    const profilePhoto = getProfilePhoto(selectedMatch.matchedProfile);
    const otherName = selectedMatch.matchedProfile.full_name.split(" ")[0];

    // Find the last read message index for "Seen" indicator
    const lastSeenIdx = (() => {
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].sender_id === user?.id && messages[i].read) return i;
      }
      return -1;
    })();

    return (
      <div data-in-chat="true" className="flex h-[100dvh] flex-col bg-background">
        {/* Chat header */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <button
            onClick={() => { setSelectedMatchId(null); setReplyTo(null); setEditingMessage(null); refetch(); }}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative h-10 w-10 flex-shrink-0">
            <img
              src={profilePhoto}
              alt={selectedMatch.matchedProfile.full_name}
              className="h-10 w-10 rounded-full object-cover border-2 border-primary"
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background transition-colors duration-500 ${connected ? "bg-green-500" : "bg-muted-foreground/40"}`}
            />
          </div>

          <div className="flex-1">
            <p className="font-semibold text-foreground leading-tight">
              {selectedMatch.matchedProfile.full_name}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {connected ? (
                <>
                  <Wifi className="w-3 h-3 text-green-500" />
                  <span className="text-green-600 font-medium">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  Connecting…
                </>
              )}
            </p>
          </div>

          {selectedMatch.status === "pending_them" && (
            <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-600 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3" /> Pending
            </span>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {selectedMatch.status === "no_messages" && messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm mt-12">
              <div className="mx-auto w-16 h-16 rounded-full gradient-brand flex items-center justify-center mb-3">
                <Heart className="w-8 h-8 text-primary-foreground" />
              </div>
              <p className="font-semibold text-foreground mb-1">You matched!</p>
              <p>Send a message to start the conversation</p>
            </div>
          )}
          {selectedMatch.status === "pending_them" && messages.length > 0 && (
            <div className="text-center mb-4">
              <span className="text-xs bg-amber-500/20 text-amber-600 px-3 py-1 rounded-full">
                Waiting for {otherName} to accept
              </span>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => {
              const isMe = msg.sender_id === user?.id;
              const isUnsent = !!msg.deleted_at;
              const isEdited = !!msg.edited_at && !isUnsent;
              const replyMsg = getReplyMessage(msg);
              const prevMsg = idx > 0 ? messages[idx - 1] : null;
              const showDate = shouldShowDateSeparator(prevMsg, msg);
              // Show "Seen" under the last message from me that was read
              const showSeen = isMe && idx === lastSeenIdx && idx === messages.length - 1;

              return (
                <div key={msg.id}>
                  {/* Date separator */}
                  {showDate && (
                    <div className="flex items-center justify-center my-4">
                      <span className="text-xs text-muted-foreground/60 bg-muted px-3 py-1 rounded-full">
                        {formatDate(msg.created_at)}
                      </span>
                    </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.15 }}
                    className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1 group relative`}
                    onContextMenu={(e) => handleContextMenu(e, msg)}
                    onTouchStart={handleTouchStart(msg)}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchEnd}
                  >
                    {/* Avatar for their messages */}
                    {!isMe && (
                      <img
                        src={profilePhoto}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover mr-2 self-end flex-shrink-0"
                      />
                    )}

                    <div className="max-w-[75%]">
                      {/* Reply preview */}
                      {replyMsg && !isUnsent && (
                        <div className={`text-xs px-3 py-1.5 rounded-t-xl ${isMe ? "bg-primary/20 text-primary-foreground/70 ml-auto" : "bg-muted text-muted-foreground"} border-l-2 border-primary/50 mb-0.5 max-w-full`}>
                          <span className="font-semibold text-[10px] uppercase tracking-wide block">
                            {replyMsg.sender_id === user?.id ? "You" : otherName}
                          </span>
                          <span className="line-clamp-1">
                            {replyMsg.deleted_at ? "Message was unsent" : replyMsg.content}
                          </span>
                        </div>
                      )}

                      {/* Message bubble */}
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm relative ${
                          isUnsent
                            ? "bg-muted/50 border border-dashed border-border text-muted-foreground/60 italic"
                            : isMe
                              ? "gradient-brand text-primary-foreground rounded-br-md"
                              : "bg-card border border-border text-foreground rounded-bl-md"
                        } ${copiedId === msg.id ? "ring-2 ring-primary/40" : ""}`}
                      >
                        {isUnsent ? (
                          <span className="flex items-center gap-1.5">
                            <Trash2 className="w-3 h-3" />
                            {isMe ? "You unsent a message" : `${otherName} unsent a message`}
                          </span>
                        ) : (
                          <>
                            {msg.content}
                            <div className={`flex items-center gap-1.5 mt-1 ${isMe ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
                              <span className="text-[10px]">{formatTime(msg.created_at)}</span>
                              {isEdited && <span className="text-[10px] italic">edited</span>}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Seen indicator */}
                      {showSeen && (
                        <div className="text-[10px] text-muted-foreground text-right mt-0.5 flex items-center justify-end gap-1">
                          <Check className="w-3 h-3" /><Check className="w-3 h-3 -ml-2" /> Seen
                        </div>
                      )}
                    </div>

                    {/* Three-dot menu for desktop hover */}
                    {!isUnsent && (
                      <button
                        onClick={(e) => handleContextMenu(e, msg)}
                        className={`self-center opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-muted ${isMe ? "order-first mr-1" : "ml-1"}`}
                      >
                        <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    )}
                  </motion.div>
                </div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Context menu */}
        <AnimatePresence>
          {contextMenu && (
            <MessageContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              isOwn={contextMenu.message.sender_id === user?.id}
              message={contextMenu.message}
              onReply={handleReply}
              onEdit={handleStartEdit}
              onUnsend={handleStartUnsend}
              onCopy={handleCopy}
              onClose={() => setContextMenu(null)}
            />
          )}
        </AnimatePresence>

        {/* Unsend confirmation dialog */}
        <AnimatePresence>
          {unsendTarget && (
            <UnsendDialog
              onConfirm={handleConfirmUnsend}
              onCancel={() => setUnsendTarget(null)}
            />
          )}
        </AnimatePresence>

        {/* Reply bar */}
        <AnimatePresence>
          {replyTo && !editingMessage && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border bg-muted/50 px-4 py-2 flex items-center gap-3 overflow-hidden"
            >
              <Reply className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-primary">
                  Replying to {replyTo.sender_id === user?.id ? "yourself" : otherName}
                </p>
                <p className="text-xs text-muted-foreground truncate">{replyTo.content}</p>
              </div>
              <button onClick={() => setReplyTo(null)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit bar */}
        <AnimatePresence>
          {editingMessage && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border bg-blue-50 dark:bg-blue-950/30 px-4 py-2 flex items-center gap-3 overflow-hidden"
            >
              <Pencil className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-blue-500">Editing message</p>
                <p className="text-xs text-muted-foreground truncate">{editingMessage.content}</p>
              </div>
              <button onClick={handleCancelEdit} className="text-muted-foreground hover:text-foreground p-1">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="border-t border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={editingMessage ? editText : newMessage}
              onChange={(e) => editingMessage ? setEditText(e.target.value) : setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={
                editingMessage
                  ? "Edit your message…"
                  : selectedMatch.status === "no_messages"
                    ? "Say hello to start…"
                    : "Type a message…"
              }
              className="flex-1 rounded-full bg-card border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition-shadow"
            />
            <button
              onClick={handleSend}
              disabled={editingMessage ? !editText.trim() : !newMessage.trim()}
              className={`flex h-11 w-11 items-center justify-center rounded-full text-primary-foreground disabled:opacity-40 transition-all hover:opacity-90 active:scale-95 ${
                editingMessage ? "bg-blue-500" : "gradient-brand"
              }`}
            >
              {editingMessage ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Match list view ──────────────────────────────────────────────────
  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      <TopNav />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-sm px-4 py-4">
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab("chats")}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-colors relative ${
                activeTab === "chats"
                  ? "gradient-brand text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              Chats
              {totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {totalUnread}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-colors relative ${
                activeTab === "requests"
                  ? "gradient-brand text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              Requests
              {requestCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {requestCount}
                </span>
              )}
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder={activeTab === "chats" ? "Search conversations" : "Search requests"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {loading && (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-card p-3">
                  <Skeleton className="h-14 w-14 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-28 rounded-full" />
                    <Skeleton className="h-3 w-40 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Chats Tab ── */}
          {!loading && activeTab === "chats" && (
            <>
              {/* New Matches */}
              {newMatches.length > 0 && (
                <>
                  <h3 className="mb-3 text-sm font-bold text-primary flex items-center gap-2">
                    <Heart className="w-4 h-4" /> New Matches
                  </h3>
                  <div className="mb-6 flex gap-4 overflow-x-auto pb-2">
                    {newMatches.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMatchId(m.id)}
                        className="flex flex-col items-center flex-shrink-0"
                      >
                        <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-primary relative">
                          <img
                            src={getProfilePhoto(m.matchedProfile)}
                            alt={m.matchedProfile.full_name}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <span className="mt-1 text-xs text-foreground truncate max-w-[4rem]">
                          {m.matchedProfile.full_name.split(" ")[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Sent Requests (waiting for them) */}
              {sentRequests.length > 0 && (
                <>
                  <h3 className="mb-3 text-sm font-bold text-amber-600 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Pending Sent
                  </h3>
                  <div className="space-y-2 mb-6">
                    {sentRequests.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMatchId(m.id)}
                        className="flex w-full items-center gap-3 rounded-xl bg-card p-3 text-left transition-colors hover:bg-muted border border-amber-500/20"
                      >
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full">
                          <img
                            src={getProfilePhoto(m.matchedProfile)}
                            alt={m.matchedProfile.full_name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground">{m.matchedProfile.full_name}</span>
                            <span className="text-xs text-amber-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          </div>
                          <p className="truncate text-sm text-muted-foreground">
                            {m.lastMessage || "Waiting for response…"}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Active Conversations */}
              {filteredAccepted.length > 0 && (
                <>
                  <h3 className="mb-3 text-sm font-bold text-primary flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Conversations
                  </h3>
                  <div className="space-y-2">
                    {filteredAccepted.map((m) => (
                      <motion.button
                        key={m.id}
                        onClick={() => setSelectedMatchId(m.id)}
                        className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-muted ${
                          m.hasUnread ? "bg-primary/5 border border-primary/20" : "bg-card"
                        }`}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="relative h-14 w-14 flex-shrink-0">
                          <img
                            src={getProfilePhoto(m.matchedProfile)}
                            alt={m.matchedProfile.full_name}
                            className="h-14 w-14 rounded-full object-cover"
                          />
                          {m.hasUnread && (
                            <span className="absolute bottom-0 right-0 w-4 h-4 bg-primary rounded-full border-2 border-background animate-pulse" />
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <span className={`font-semibold ${m.hasUnread ? "text-primary" : "text-foreground"}`}>
                              {m.matchedProfile.full_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {m.lastMessageAt ? new Date(m.lastMessageAt).toLocaleDateString() : ""}
                            </span>
                          </div>
                          <p className={`truncate text-sm ${m.hasUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                            {m.lastMessage || "Start chatting"}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </>
              )}

              {newMatches.length === 0 && sentRequests.length === 0 && filteredAccepted.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-16"
                >
                  <div className="mx-auto h-20 w-20 rounded-full gradient-brand flex items-center justify-center mb-4">
                    <Heart className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <p className="text-lg font-semibold text-foreground">No conversations yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Keep swiping to find your match!</p>
                  <Button className="mt-4" onClick={() => navigate("/swipe")}>
                    Start Swiping
                  </Button>
                </motion.div>
              )}
            </>
          )}

          {/* ── Requests Tab ── */}
          {!loading && activeTab === "requests" && (
            <>
              {filteredRequests.length > 0 ? (
                <>
                  <h3 className="mb-3 text-sm font-bold text-foreground">
                    Message Requests ({filteredRequests.length})
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    These people want to chat with you. View their profile to accept or decline.
                  </p>
                  <div className="space-y-3">
                    {filteredRequests.map((m) => (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl bg-card border border-border p-4"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full border-2 border-primary">
                            <img
                              src={getProfilePhoto(m.matchedProfile)}
                              alt={m.matchedProfile.full_name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{m.matchedProfile.full_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {m.matchedProfile.occupation_title}
                            </p>
                          </div>
                        </div>

                        {m.lastMessage && (
                          <div className="bg-muted/50 rounded-lg p-3 mb-3">
                            <p className="text-sm text-foreground line-clamp-2">"{m.lastMessage}"</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setViewingProfile(m.id)}
                          >
                            <User className="w-4 h-4 mr-1" />
                            View Profile
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 gradient-brand text-primary-foreground"
                            onClick={() => handleAcceptRequest(m.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-16"
                >
                  <div className="mx-auto h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <MessageCircle className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-semibold text-foreground">No requests</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    When someone sends you a message, it'll appear here
                  </p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
