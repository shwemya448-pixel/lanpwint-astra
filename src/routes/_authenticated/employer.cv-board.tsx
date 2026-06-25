import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/cv-board")({
  head: () => ({ meta: [{ title: "CV Board — Lan Pwint" }] }),
  component: CVBoardPage,
});

function CVBoardPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.22em] text-teal">CV Board</p>
        <h1 className="mt-2 font-serif text-3xl text-navy sm:text-4xl">Browse student CVs</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Discover candidates by skill, education, and availability. Open a card to view full profile and message.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="mt-3 font-serif text-lg text-navy">Student name</div>
              <div className="text-xs text-muted-foreground">University · Year</div>
              <p className="mt-3 text-sm text-muted-foreground">Skills and short bio will appear here.</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
