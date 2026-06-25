import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/candidates/recruiter-dashboard")({
  head: () => ({ meta: [{ title: "Open employer workspace — Lan Pwint" }] }),
  component: RecruiterDashboardPage,
});

function RecruiterDashboardPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lp-reveal">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[color:var(--navy)] to-[color:var(--deep)] p-10 text-[color:var(--mist)]">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[color:var(--gold)]/20 blur-3xl lp-float" />
        <div className="relative grid items-center gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--gold)]">Employer workspace</p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl">Everything you need to hire — in one tab</h2>
            <p className="mt-3 max-w-2xl opacity-85">
              Post jobs, drop them on the Myanmar map, browse the CV board, and message students. All synced in realtime.
            </p>
          </div>
          <div className="lg:justify-self-end">
            <Button asChild size="lg" className="bg-[color:var(--gold)] text-[color:var(--navy)] hover:brightness-110">
              <Link to="/auth" search={{ as: "employer" }}>
                Open the workspace <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
