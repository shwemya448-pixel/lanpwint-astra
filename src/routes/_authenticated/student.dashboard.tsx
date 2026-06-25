import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Briefcase, FileText, MapPin, MessageSquare, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/student/dashboard")({
  head: () => ({ meta: [{ title: "Overview — Lan Pwint" }] }),
  component: StudentDashboard,
});

const TILES = [
  { icon: BookOpen, title: "Learn & Earn", body: "Career videos by category.", to: "/student/learn", cta: "Watch & learn" },
  { icon: MessageSquare, title: "Messages", body: "Chat directly with employers.", to: "/student/messages", cta: "Open messages" },
  { icon: MapPin, title: "Job map", body: "Open roles across Myanmar.", to: "/student/job-map", cta: "Open map" },
  { icon: Sparkles, title: "CV Analyzer", body: "AI feedback and match score.", to: "/student/cv-analyzer", cta: "Analyze CV" },
  { icon: User, title: "My CV", body: "Manage your discoverable profile.", to: "/student/my-cv", cta: "Manage CV" },
  { icon: Briefcase, title: "Browse jobs", body: "Internships and graduate roles.", to: "/student/jobs", cta: "View openings" },
  { icon: FileText, title: "My applications", body: "Track applications and offers.", to: "/student/applications", cta: "Open" },
  { icon: BookOpen, title: "Lessons", body: "Curated learning library.", to: "/student/lessons", cta: "Open lessons" },
];

function StudentDashboard() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.22em] text-teal">Overview</p>
      <h1 className="mt-2 font-serif text-3xl text-navy sm:text-4xl">Your career, one step at a time</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Everything you need to learn, apply, and grow — built just for students.
      </p>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {TILES.map((t) => (
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
    </section>
  );
}
