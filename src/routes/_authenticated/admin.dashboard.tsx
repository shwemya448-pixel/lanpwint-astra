import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, Eye, GraduationCap, Newspaper, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useViewRole } from "@/lib/view-role";
import type { AppRole } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin — Lan Pwint" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { viewRole, setViewRole } = useViewRole();
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-[color:var(--gold)]">
        <Shield className="h-5 w-5" />
        <span className="text-xs uppercase tracking-[0.22em]">Admin workspace</span>
      </div>
      <h1 className="mt-2 font-serif text-3xl text-navy sm:text-4xl">Run Lan Pwint</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Manage news, switch perspectives, and preview every role's experience.
      </p>

      <div className="mt-6 rounded-xl border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/10 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-[color:var(--gold)]">
            <Eye className="h-4 w-4" />
            <span>
              Previewing as <strong className="capitalize">{viewRole}</strong>. Switch perspective to enter
              that role's workspace.
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {(["admin", "student", "employer"] as AppRole[]).map((r) => (
              <Button
                key={r}
                size="sm"
                variant={viewRole === r ? "default" : "outline"}
                onClick={() => setViewRole(r)}
                className={viewRole === r ? "bg-[color:var(--gold)] text-[color:var(--navy)] hover:brightness-110" : ""}
              >
                <span className="capitalize">{r}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Tile icon={Newspaper} title="News editor" body="Publish bilingual announcements and articles." to="/admin/news" cta="Open news admin" />
        <Tile icon={GraduationCap} title="Student workspace" body="Open the full student experience." to="/student/dashboard" cta="Enter student" />
        <Tile icon={Briefcase} title="Employer workspace" body="Open the full employer experience." to="/employer/dashboard" cta="Enter employer" />
      </div>
    </section>
  );
}

function Tile({
  icon: Icon, title, body, to, cta,
}: { icon: any; title: string; body: string; to: string; cta: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <Icon className="h-5 w-5 text-[color:var(--gold)]" />
      <h3 className="mt-3 font-serif text-xl text-navy">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <Button asChild className="mt-5 w-full bg-navy text-navy-foreground hover:bg-deep">
        <Link to={to}>{cta}</Link>
      </Button>
    </div>
  );
}
