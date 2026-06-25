import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/employer/messages")({
  head: () => ({ meta: [{ title: "Messages — Employer — Lan Pwint" }] }),
  component: EmployerMessagesPage,
});

function EmployerMessagesPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--gold)]">Messages</p>
        <h1 className="mt-2 font-serif text-3xl text-navy sm:text-4xl">Chat with candidates</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Start conversations from a CV card or an application. Direct messaging is being set up.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-[280px,1fr]">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="text-sm font-medium text-navy">Conversations</div>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">No conversations yet.</div>
          </div>
          <div className="grid min-h-[360px] place-items-center rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Select a conversation to start chatting.
          </div>
        </div>
      </section>
    </PageShell>
  );
}
