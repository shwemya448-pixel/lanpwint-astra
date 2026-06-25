import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/student/my-cv")({
  head: () => ({ meta: [{ title: "My CV — Lan Pwint" }] }),
  component: MyCVPage,
});

function MyCVPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.22em] text-teal">My CV</p>
        <h1 className="mt-2 font-serif text-3xl text-navy sm:text-4xl">Manage your CV profile</h1>
        <p className="mt-3 text-muted-foreground">
          Keep your profile updated so employers can find you on the CV Board.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link to="/profile" className="rounded-2xl border border-border bg-card p-6 hover:border-[color:var(--gold)]">
            <div className="font-serif text-lg text-navy">Edit profile</div>
            <div className="mt-1 text-sm text-muted-foreground">Skills, education, and bio.</div>
          </Link>
          <Link to="/cv-analyzer" className="rounded-2xl border border-border bg-card p-6 hover:border-[color:var(--gold)]">
            <div className="font-serif text-lg text-navy">Analyze my CV</div>
            <div className="mt-1 text-sm text-muted-foreground">Get AI feedback and a match score.</div>
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <div className="font-serif text-lg text-navy">CV file</div>
          <p className="mt-2 text-sm text-muted-foreground">Upload coming next.</p>
          <Button disabled className="mt-4">Upload CV</Button>
        </div>
      </section>
    </PageShell>
  );
}
