import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, FileText, MessageSquare, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/employer/dashboard")({
  head: () => ({ meta: [{ title: "Employer dashboard — Lan Pwint" }] }),
  component: EmployerDashboard,
});

const TILES = [
  { icon: Users, title: "CV Board", body: "Browse student profiles and discover candidates.", to: "/employer/cv-board", cta: "Browse CVs" },
  { icon: Plus, title: "Post a new job", body: "Reach motivated students and graduates.", to: "/employer/jobs/new", cta: "Create post" },
  { icon: Briefcase, title: "My job posts", body: "Edit, close, or reopen your roles.", to: "/employer/jobs", cta: "View posts" },
  { icon: FileText, title: "Applications", body: "Review CVs and send offers.", to: "/employer/applications", cta: "Review" },
  { icon: MessageSquare, title: "Messages", body: "Connect with students directly.", to: "/employer/messages", cta: "Open messages" },
];

function EmployerDashboard() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--gold)]">Employer workspace</p>
      <h1 className="mt-2 font-serif text-3xl text-navy sm:text-4xl">Hire your next great teammate</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Post roles, browse the CV board, and message candidates — all from one place.
      </p>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {TILES.map((t) => (
          <div key={t.title} className="rounded-2xl border border-border bg-card p-6">
            <t.icon className="h-5 w-5 text-[color:var(--gold)]" />
            <h3 className="mt-3 font-serif text-xl text-navy">{t.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t.body}</p>
            <Button asChild className="mt-5 w-full bg-navy text-navy-foreground hover:bg-deep">
              <Link to={t.to}>{t.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
