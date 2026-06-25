import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

type PartnerProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

const db: any = supabase;

export function MessagesView({ accentLabel }: { accentLabel: string }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [profiles, setProfiles] = useState<Record<string, PartnerProfile>>({});
  const [activePartner, setActivePartner] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newError, setNewError] = useState("");
  const [adding, setAdding] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Load current user + messages
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id ?? null;
      if (!mounted) return;
      setUserId(uid);
      if (uid) await refresh(uid);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;
    const ch = db
      .channel(`messages:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload: any) => {
          const m = payload.new as Msg;
          if (m.sender_id !== userId && m.recipient_id !== userId) return;
          setMessages((cur) => (cur.some((x) => x.id === m.id) ? cur : [...cur, m]));
          ensureProfile(m.sender_id === userId ? m.recipient_id : m.sender_id);
        },
      )
      .subscribe();
    return () => { db.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function ensureProfile(id: string) {
    if (profiles[id]) return;
    const { data } = await db.from("profiles").select("id, full_name, avatar_url").eq("id", id).maybeSingle();
    if (data) setProfiles((p) => ({ ...p, [id]: data }));
  }

  async function refresh(uid: string) {
    const { data, error } = await db
      .from("messages")
      .select("id, sender_id, recipient_id, body, created_at, read_at")
      .or(`sender_id.eq.${uid},recipient_id.eq.${uid}`)
      .order("created_at", { ascending: true });
    if (error || !data) return;
    setMessages(data as Msg[]);
    const partnerIds = Array.from(
      new Set((data as Msg[]).map((m) => (m.sender_id === uid ? m.recipient_id : m.sender_id))),
    );
    if (partnerIds.length) {
      const { data: profs } = await db
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", partnerIds);
      const map: Record<string, PartnerProfile> = {};
      (profs ?? []).forEach((p: PartnerProfile) => (map[p.id] = p));
      setProfiles(map);
      if (!activePartner) setActivePartner(partnerIds[0]);
    }
  }

  // Conversation list (latest message per partner)
  const conversations = useMemo(() => {
    if (!userId) return [] as { partnerId: string; last: Msg }[];
    const byPartner = new Map<string, Msg>();
    for (const m of messages) {
      const pid = m.sender_id === userId ? m.recipient_id : m.sender_id;
      const cur = byPartner.get(pid);
      if (!cur || new Date(m.created_at) > new Date(cur.created_at)) byPartner.set(pid, m);
    }
    return Array.from(byPartner.entries())
      .map(([partnerId, last]) => ({ partnerId, last }))
      .sort((a, b) => +new Date(b.last.created_at) - +new Date(a.last.created_at));
  }, [messages, userId]);

  const thread = useMemo(
    () =>
      !userId || !activePartner
        ? []
        : messages.filter(
            (m) =>
              (m.sender_id === userId && m.recipient_id === activePartner) ||
              (m.sender_id === activePartner && m.recipient_id === userId),
          ),
    [messages, userId, activePartner],
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [thread.length, activePartner]);

  async function send() {
    if (!userId || !activePartner) return;
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    const { data, error } = await db
      .from("messages")
      .insert({ sender_id: userId, recipient_id: activePartner, body })
      .select("id, sender_id, recipient_id, body, created_at, read_at")
      .single();
    setSending(false);
    if (error) return;
    setMessages((cur) => (cur.some((x) => x.id === data.id) ? cur : [...cur, data as Msg]));
    setDraft("");
  }

  async function startConversation() {
    setNewError("");
    if (!userId) return;
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    setAdding(true);
    const { data, error } = await db
      .from("profiles")
      .select("id, full_name, avatar_url, contact_email")
      .ilike("contact_email", email)
      .maybeSingle();
    setAdding(false);
    if (error || !data) {
      setNewError("No user found with that contact email.");
      return;
    }
    setProfiles((p) => ({ ...p, [data.id]: { id: data.id, full_name: data.full_name, avatar_url: data.avatar_url } }));
    setActivePartner(data.id);
    setNewEmail("");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading messages…
      </div>
    );
  }

  const activeProfile = activePartner ? profiles[activePartner] : null;

  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-[300px,1fr]">
      {/* Sidebar */}
      <aside className="rounded-2xl border border-border bg-card p-3">
        <div className="flex items-center justify-between px-2">
          <div className="text-sm font-semibold text-navy">Conversations</div>
          <span className="text-[10px] uppercase tracking-wider page-gold">{accentLabel}</span>
        </div>

        <div className="mt-3 rounded-xl border border-border/70 bg-background p-2">
          <label className="flex items-center gap-1 px-1 pb-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            <UserPlus className="h-3 w-3" /> New chat
          </label>
          <div className="flex gap-1.5">
            <Input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="contact email"
              className="h-8 text-xs"
            />
            <Button size="sm" className="h-8 lp-gold-btn" onClick={startConversation} disabled={adding || !newEmail.trim()}>
              {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Add"}
            </Button>
          </div>
          {newError && <p className="mt-1 text-[11px] text-destructive">{newError}</p>}
        </div>

        <div className="mt-3 space-y-1">
          {conversations.length === 0 && (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground">
              No conversations yet. Add someone by their contact email above.
            </p>
          )}
          {conversations.map(({ partnerId, last }) => {
            const p = profiles[partnerId];
            const active = partnerId === activePartner;
            return (
              <button
                key={partnerId}
                onClick={() => setActivePartner(partnerId)}
                className={cn(
                  "w-full rounded-xl border px-3 py-2 text-left transition-all",
                  active
                    ? "border-[color:var(--gold)] bg-[color:var(--gold)]/10"
                    : "border-border/60 bg-background hover:border-[color:var(--gold)]/60",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-navy">
                    {p?.full_name || "Unknown user"}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {new Date(last.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{last.body}</p>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Thread */}
      <div className="flex min-h-[420px] flex-col rounded-2xl border border-border bg-card">
        {!activePartner ? (
          <div className="grid flex-1 place-items-center p-8 text-center text-sm text-muted-foreground">
            Pick a conversation or start a new one to begin chatting.
          </div>
        ) : (
          <>
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-navy">
                  {activeProfile?.full_name || "Conversation"}
                </div>
                <div className="text-[11px] text-muted-foreground">Direct message</div>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
              {thread.length === 0 && (
                <p className="text-center text-xs text-muted-foreground">Say hello 👋</p>
              )}
              {thread.map((m) => {
                const mine = m.sender_id === userId;
                return (
                  <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm",
                        mine
                          ? "bg-[color:var(--gold)] text-[color:var(--navy)]"
                          : "border border-border bg-background text-foreground",
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      <p className={cn("mt-0.5 text-[10px]", mine ? "text-[color:var(--navy)]/70" : "text-muted-foreground")}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex items-end gap-2 border-t border-border p-3"
            >
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                }}
                placeholder="Write a message…"
                className="min-h-[44px] max-h-40 flex-1 resize-none"
              />
              <Button type="submit" disabled={sending || !draft.trim()} className="lp-gold-btn h-11 px-4">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
