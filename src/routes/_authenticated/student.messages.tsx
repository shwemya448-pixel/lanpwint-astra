import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { MessagesView } from "@/components/messages-view";

export const Route = createFileRoute("/_authenticated/student/messages")({
  head: () => ({ meta: [{ title: "Messages — Lan Pwint" }] }),
  component: MessagesPage,
});

function MessagesPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.22em] page-gold">Messages</p>
        <h1 className="mt-2 font-serif text-3xl text-navy sm:text-4xl">
          Connect with employers &amp; mentors
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Add someone by their profile's contact email to start a private conversation.
        </p>
        <MessagesView accentLabel="Student" />
      </section>
    </PageShell>
  );
}
