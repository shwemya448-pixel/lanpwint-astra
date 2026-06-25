import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, FileText, MapPin, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/employer/dashboard")({
  head: () => ({ meta: [{ title: "Employer overview — Lan Pwint" }] }),
  component: EmployerDashboard,
});

const TILES = [
  { icon: Plus, title: "Post a new job", body: "Open roles published in minutes.", to: "/employer/jobs/new", cta: "Create post" },
  { icon: Briefcase, title: "My job posts", body: "Edit, close, or reopen your roles.", to: "/employer/jobs", cta: "View posts" },
  { icon: MapPin, title: "Job map", body: "Pin your jobs on the Myanmar map.", to: "/employer/job-map", cta: "Open map" },
  { icon: FileText, title: "Applications", body: "Student profiles unlock as soon as they apply.", to: "/employer/applications", cta: "Review" },
  { icon: MessageSquare, title: "Messages", body: "Chat with candidates who reach out or apply.", to: "/employer/messages", cta: "Open messages" },
];

function EmployerDashboard() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lp-reveal">
      <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--gold)]">Employer workspace</p>
      <h1 className="mt-2 font-serif text-3xl text-foreground sm:text-4xl">Hire your next great teammate</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Post roles, drop them on the map, browse the CV board, and message candidates — all in one place.
      </p>
      <div className="mt-4 lp-divider-gold w-32" />

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3 lp-reveal-stagger">
        {TILES.map((t) => (
          <div key={t.title} className="lp-card group p-6 transition-all hover:-translate-y-1 hover:shadow-2xl">
            <div className="h-11 w-11 rounded-xl lp-glass flex items-center justify-center text-[color:var(--gold)] transition-transform group-hover:scale-110">
              <t.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-serif text-xl text-foreground">{t.title}</h3>
            <div className="mt-2 lp-divider-gold" />
            <p className="mt-3 text-sm text-muted-foreground">{t.body}</p>
            <Button asChild className="mt-5 w-full bg-[color:var(--navy)] text-[color:var(--navy-foreground)] hover:bg-[color:var(--deep)]">
              <Link to={t.to}>{t.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
