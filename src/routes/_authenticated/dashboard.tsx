import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Briefcase, FileText, LogOut, Plus, User, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useUserRoles, type AppRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/page-shell";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Lan Pwint" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useSession();
  const roles = useUserRoles(user);
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle().then(({ data }) => {
      setProfile(data ?? null);
    });
  }, [user]);

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const role: AppRole = roles[0] ?? "student";

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-teal">Your dashboard</p>
            <h1 className="mt-2 font-serif text-3xl text-navy sm:text-4xl">
              Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}.
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{user?.email}</span>
              {roles.map((r) => (
                <Badge key={r} variant="secondary" className="bg-teal/15 text-teal">{r}</Badge>
              ))}
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>

        {role === "employer" ? <EmployerHome /> : <StudentHome />}
      </section>
    </PageShell>
  );
}

type Tile = { icon: any; title: string; body: string; to: string; cta: string };

function TileGrid({ tiles }: { tiles: Tile[] }) {
  return (
    <div className="mt-10 grid gap-5 md:grid-cols-3">
      {tiles.map((t) => (
        <div key={t.title} className="rounded-2xl border border-border bg-card p-6">
          <t.icon className="h-5 w-5 text-teal" />
          <h3 className="mt-3 font-serif text-xl text-navy">{t.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t.body}</p>
          <Button asChild className="mt-5 w-full bg-navy text-navy-foreground hover:bg-deep">
            <Link to={t.to}>{t.cta}</Link>
          </Button>
        </div>
      ))}
    </div>
  );
}

function StudentHome() {
  return (
    <TileGrid
      tiles={[
        { icon: Briefcase, title: "Browse jobs", body: "Internships and graduate roles from real employers.", to: "/jobs", cta: "View openings" },
        { icon: FileText, title: "My applications", body: "Track your applications and respond to offers.", to: "/applications", cta: "My applications" },
        { icon: BookOpen, title: "Learning Center", body: "Watch video lessons from real internship experiences.", to: "/lessons", cta: "Start learning" },
        { icon: User, title: "My profile", body: "Skills, education, certificates, and CV.", to: "/profile", cta: "Edit profile" },
      ]}
    />
  );
}

function EmployerHome() {
  return (
    <TileGrid
      tiles={[
        { icon: Plus, title: "Post a new job", body: "Reach motivated students and graduates.", to: "/employer/jobs/new", cta: "Create job post" },
        { icon: Briefcase, title: "My job posts", body: "Edit, close or reopen your roles.", to: "/employer/jobs", cta: "View posts" },
        { icon: Users, title: "Applications", body: "Review CVs and send offers to candidates.", to: "/employer/applications", cta: "Review applicants" },
      ]}
    />
  );
}
