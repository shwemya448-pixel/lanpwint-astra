import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/candidates/recruiter-dashboard")({
  head: () => ({ meta: [{ title: "Recruiter Dashboard — Lan Pwint" }] }),
  component: RecruiterDashboardPage,
});

function RecruiterDashboardPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-gradient-to-br from-navy to-deep p-10 text-navy-foreground">
        <div className="grid items-center gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-serif text-2xl sm:text-3xl">A dashboard built for recruiters</h2>
            <p className="mt-2 opacity-85">
              Manage saved candidates, communication history, and recruitment activities in one place.
            </p>
          </div>
          <div className="lg:justify-self-end">
            <Button asChild size="lg" className="bg-mist text-navy hover:bg-mist/90">
              <Link to="/auth" search={{ as: "employer" }}>Open recruiter dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
