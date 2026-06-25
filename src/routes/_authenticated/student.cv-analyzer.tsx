import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/student/cv-analyzer")({
  head: () => ({ meta: [{ title: "CV Analyzer — Lan Pwint" }] }),
  component: CVAnalyzerPage,
});

function CVAnalyzerPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.22em] text-teal">CV Analyzer</p>
        <h1 className="mt-2 font-serif text-3xl text-navy sm:text-4xl">AI feedback on your CV</h1>
        <p className="mt-3 text-muted-foreground">
          Upload your CV and (optionally) pick a job posting. The AI will score your CV, list strengths and
          weaknesses, and rate how well you match the role.
        </p>

        <div className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6">
          <div>
            <label className="text-sm font-medium text-navy">Upload CV (PDF)</label>
            <input
              type="file"
              accept="application/pdf"
              disabled
              className="mt-2 block w-full rounded-md border border-border bg-background p-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-navy">Match against job (optional)</label>
            <select disabled className="mt-2 block w-full rounded-md border border-border bg-background p-2 text-sm">
              <option>— Choose a job posting —</option>
            </select>
          </div>
          <Button disabled className="w-full bg-navy text-navy-foreground hover:bg-deep">
            Analyze (coming next)
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
