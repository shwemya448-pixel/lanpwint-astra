import { createFileRoute, Link } from "@tanstack/react-router";
import { FileSearch, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/graduates/cv-analyzer")({
  head: () => ({ meta: [{ title: "CV Analyzer — Lan Pwint" }] }),
  component: CVAnalyzerPage,
});

const CV_FEEDBACK = [
  { label: "Formatting", score: "Strong" },
  { label: "Skills clarity", score: "Improve" },
  { label: "Impact statements", score: "Good" },
  { label: "Keywords for ATS", score: "Improve" },
];

function CVAnalyzerPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Badge variant="secondary" className="bg-teal/15 text-teal hover:bg-teal/20">
            <FileSearch className="mr-1 h-3 w-3" /> AI CV Analyzer
          </Badge>
          <h2 className="mt-4 font-serif text-3xl text-navy">
            Upload your CV. Get honest feedback in seconds.
          </h2>
          <p className="mt-3 text-muted-foreground">
            We review formatting, skills, strengths, weaknesses, and give targeted improvement suggestions — so the
            first impression you make on employers is the right one.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-navy text-navy-foreground hover:bg-deep">
              <Link to="/auth" search={{ as: "student" }}>Analyze my CV</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/graduates/profile">Create a profile</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Sample analysis</div>
            <Sparkles className="h-4 w-4 text-teal" />
          </div>
          <ul className="mt-4 divide-y divide-border">
            {CV_FEEDBACK.map((f) => (
              <li key={f.label} className="flex items-center justify-between py-3 text-sm">
                <span>{f.label}</span>
                <span className={f.score === "Improve" ? "text-destructive font-medium" : "text-teal font-medium"}>
                  {f.score}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
