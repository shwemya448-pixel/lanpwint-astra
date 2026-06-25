import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/candidates/browse")({
  head: () => ({ meta: [{ title: "How the CV Board works — Lan Pwint" }] }),
  component: BrowsePage,
});

const STEPS = [
  { n: "01", t: "Sign in as employer", d: "Create or sign into your employer account to unlock the CV Board." },
  { n: "02", t: "Filter the talent pool", d: "Search by skill, university, year, and location across verified students." },
  { n: "03", t: "Open a profile", d: "See the full CV, downloads, and history — exactly what the student published." },
  { n: "04", t: "Send a message", d: "One click opens a realtime chat. No more cold emails." },
];

function BrowsePage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lp-reveal">
      <div className="lp-card p-8 sm:p-10">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl lp-glass flex items-center justify-center text-[color:var(--gold)]">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-serif text-2xl text-foreground sm:text-3xl">The Lan Pwint CV Board</h2>
            <p className="text-sm text-muted-foreground">Real candidates, refreshed daily. Visible to verified employers only.</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lp-reveal-stagger">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-xl border border-border bg-background/40 p-5">
              <div className="text-xs font-mono text-[color:var(--gold)]">{s.n}</div>
              <h3 className="mt-1 font-serif text-lg text-foreground">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-start gap-3 rounded-xl border border-[color:var(--gold)]/30 bg-[color:var(--gold)]/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm text-foreground/85">
            <Lock className="h-4 w-4 text-[color:var(--gold)]" />
            Candidate names, contact emails, and CVs are hidden until you sign in.
          </div>
          <Button asChild size="lg" className="bg-[color:var(--gold)] text-[color:var(--navy)] hover:brightness-110">
            <Link to="/auth" search={{ as: "employer" }}>Sign in to open the CV Board</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
