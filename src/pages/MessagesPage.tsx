import TopNav from "@/components/TopNav";
import { Search } from "lucide-react";
import { profiles } from "@/data/profiles";

const MessagesPage = () => {
  const matches = profiles.slice(0, 3);
  const conversations = [
    { profile: profiles[0], lastMessage: "Hey! How are you? 😊", time: "2m ago", unread: true },
    { profile: profiles[2], lastMessage: "That sounds amazing!", time: "1h ago", unread: false },
  ];

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      <TopNav />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-sm px-4 py-4">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search matches"
              className="w-full rounded-full bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* New Matches */}
          <h3 className="mb-3 text-sm font-bold text-primary">New Matches</h3>
          <div className="mb-6 flex gap-4 overflow-x-auto pb-2">
            {matches.map((m) => (
              <div key={m.id} className="flex flex-col items-center">
                <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-primary">
                  <img src={m.image} alt={m.name} className="h-full w-full object-cover" />
                </div>
                <span className="mt-1 text-xs text-foreground">{m.name}</span>
              </div>
            ))}
          </div>

          {/* Messages */}
          <h3 className="mb-3 text-sm font-bold text-primary">Messages</h3>
          <div className="space-y-2">
            {conversations.map(({ profile, lastMessage, time, unread }) => (
              <button
                key={profile.id}
                className="flex w-full items-center gap-3 rounded-xl bg-card p-3 text-left transition-colors hover:bg-muted"
              >
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full">
                  <img src={profile.image} alt={profile.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{profile.name}</span>
                    <span className="text-xs text-muted-foreground">{time}</span>
                  </div>
                  <p className={`truncate text-sm ${unread ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                    {lastMessage}
                  </p>
                </div>
                {unread && <div className="h-2.5 w-2.5 rounded-full gradient-brand flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
