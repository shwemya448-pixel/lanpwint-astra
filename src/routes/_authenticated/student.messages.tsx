import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/student/messages")({
  head: () => ({ meta: [{ title: "Messages — Lan Pwint" }] }),
  component: MessagesPage,
});

function MessagesPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.22em] text-teal">Messages</p>
        <h1 className="mt-2 font-serif text-3xl text-navy sm:text-4xl">Connect with employers &amp; students</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Direct messaging is being set up. You'll be able to start conversations from job posts and CV cards.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-[280px,1fr]">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="text-sm font-medium text-navy">Conversations</div>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">No conversations yet.</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 min-h-[360px] grid place-items-center text-sm text-muted-foreground">
            Select a conversation to start chatting.
          </div>
        </div>
      </section>
    </PageShell>
  );
}
