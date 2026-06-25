import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Briefcase, FileText, LogOut, MapPin, MessageSquare, Newspaper, Plus, Shield, Sparkles, User, Users, Eye } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useSession, useUserRoles, type AppRole } from "@/lib/auth";
import { useViewRole } from "@/lib/view-role";
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

  const { viewRole, setViewRole } = useViewRole();
  const isAdmin = roles.includes("admin");
  const role: AppRole = isAdmin ? viewRole : (roles.includes("employer") ? "employer" : "student");

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

        {isAdmin && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/10 px-4 py-3 text-sm">
            <div className="flex items-center gap-2 text-[color:var(--gold)]">
              <Eye className="h-4 w-4" />
              <span>
                Viewing as <strong className="capitalize">{viewRole}</strong> — switch perspective to preview what each role sees.
              </span>
            </div>
            <div className="flex gap-1">
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
        )}

        {role === "admin" ? <AdminHome /> : role === "employer" ? <EmployerHome /> : <StudentHome />}
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
        { icon: BookOpen, title: "Learn & Earn", body: "YouTube career videos by category — interviews, CV, tech, more.", to: "/learn", cta: "Watch & learn" },
        { icon: MessageSquare, title: "Messages", body: "Chat directly with employers about jobs and offers.", to: "/messages", cta: "Open messages" },
        { icon: MapPin, title: "Job map", body: "See open jobs across Myanmar on a live map.", to: "/job-map", cta: "Open map" },
        { icon: Sparkles, title: "CV Analyzer", body: "AI scores your CV and matches it to a job posting.", to: "/cv-analyzer", cta: "Analyze CV" },
        { icon: User, title: "My CV Board", body: "Manage your profile so employers can find you.", to: "/my-cv", cta: "Manage CV" },
        { icon: Newspaper, title: "News", body: "Latest career news and announcements.", to: "/news", cta: "Read news" },
        { icon: Briefcase, title: "Browse jobs", body: "Internships and graduate roles from real employers.", to: "/jobs", cta: "View openings" },
        { icon: FileText, title: "My applications", body: "Track applications and respond to offers.", to: "/applications", cta: "My applications" },
      ]}
    />
  );
}

function EmployerHome() {
  return (
    <TileGrid
      tiles={[
        { icon: Users, title: "CV Board", body: "Browse student profiles and discover candidates.", to: "/cv-board", cta: "Browse CVs" },
        { icon: MessageSquare, title: "Messages", body: "Connect with students directly.", to: "/messages", cta: "Open messages" },
        { icon: Plus, title: "Post a new job", body: "Reach motivated students and graduates.", to: "/employer/jobs/new", cta: "Create job post" },
        { icon: Briefcase, title: "My job posts", body: "Edit, close or reopen your roles.", to: "/employer/jobs", cta: "View posts" },
        { icon: FileText, title: "Applications", body: "Review CVs and send offers to candidates.", to: "/employer/applications", cta: "Review applicants" },
        { icon: Newspaper, title: "News", body: "Industry news and platform announcements.", to: "/news", cta: "Read news" },
      ]}
    />
  );
}
