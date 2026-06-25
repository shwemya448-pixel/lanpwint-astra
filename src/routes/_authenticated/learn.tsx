import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/learn")({
  head: () => ({ meta: [{ title: "Learn & Earn — Lan Pwint" }] }),
  component: LearnPage,
});

const CATEGORIES = [
  { key: "interview", label: "Interview Tips" },
  { key: "cv", label: "CV & Resume" },
  { key: "tech", label: "Tech Careers" },
  { key: "business", label: "Business & Finance" },
  { key: "freelance", label: "Freelancing" },
  { key: "english", label: "English for Work" },
];

function LearnPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.22em] text-teal">Learn &amp; Earn</p>
        <h1 className="mt-2 font-serif text-3xl text-navy sm:text-4xl">Career videos, by category</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Curated YouTube playlists for each career skill. Pick a category to browse videos.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <div key={c.key} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-serif text-xl text-navy">{c.label}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                YouTube videos will appear here once the YouTube API key is connected.
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
          Coming next: live YouTube search by category powered by the YouTube Data API.
        </div>
      </section>
    </PageShell>
  );
}
