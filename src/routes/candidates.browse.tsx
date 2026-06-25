import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/candidates/browse")({
  head: () => ({ meta: [{ title: "Browse Candidates — Lan Pwint" }] }),
  component: BrowsePage,
});

const CANDIDATES = [
  { name: "May Thandar", role: "Frontend Developer", school: "UCSY · 2024", skills: ["React", "TypeScript", "Tailwind"] },
  { name: "Kyaw Zin Latt", role: "Data Analyst", school: "YTU · 2023", skills: ["SQL", "Python", "Power BI"] },
  { name: "Su Yee", role: "UI/UX Designer", school: "MIT (Y) · 2024", skills: ["Figma", "Prototyping", "Research"] },
  { name: "Hein Htet", role: "Backend Engineer", school: "UCSY · 2023", skills: ["Node.js", "Postgres", "Docker"] },
];

function BrowsePage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <div className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4 text-teal" />
            <span className="font-medium">Filter:</span>
            <span className="text-muted-foreground">Skills · Education · Experience · Location</span>
          </div>
          <Button asChild size="sm" className="bg-navy text-navy-foreground hover:bg-deep">
            <Link to="/auth" search={{ as: "employer" }}>Sign in to contact</Link>
          </Button>
        </div>
        <div className="divide-y divide-border">
          {CANDIDATES.map((c) => (
            <div key={c.name} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <div className="font-serif text-lg text-navy">{c.name}</div>
                <div className="text-sm text-muted-foreground">{c.role} · {c.school}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.skills.map((s) => (
                    <span key={s} className="rounded-full bg-muted px-2.5 py-1 text-xs">{s}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline"><Bookmark className="mr-1.5 h-3.5 w-3.5" /> Save</Button>
                <Button size="sm" className="bg-navy text-navy-foreground hover:bg-deep">Message</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
