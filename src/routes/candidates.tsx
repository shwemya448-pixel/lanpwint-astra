import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Filter, MessagesSquare, Search, ShieldCheck } from "lucide-react";
import { PageHeader, PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/candidates")({
  head: () => ({
    meta: [
      { title: "Candidates & Employers — Lan Pwint" },
      {
        name: "description",
        content:
          "Browse verified graduate profiles, filter by skills, education, and experience, and contact candidates directly.",
      },
      { property: "og:title", content: "Hire from Lan Pwint" },
      {
        property: "og:description",
        content: "Find graduates ready to work. Filter, save, and message directly.",
      },
    ],
  }),
  component: CandidatesPage,
});

const CANDIDATES = [
  { name: "May Thandar", role: "Frontend Developer", school: "UCSY · 2024", skills: ["React", "TypeScript", "Tailwind"] },
  { name: "Kyaw Zin Latt", role: "Data Analyst", school: "YTU · 2023", skills: ["SQL", "Python", "Power BI"] },
  { name: "Su Yee", role: "UI/UX Designer", school: "MIT (Y) · 2024", skills: ["Figma", "Prototyping", "Research"] },
  { name: "Hein Htet", role: "Backend Engineer", school: "UCSY · 2023", skills: ["Node.js", "Postgres", "Docker"] },
];

const FEATURES = [
  { icon: Search, title: "Powerful search", body: "Filter by skill, education, location, and years of experience." },
  { icon: Bookmark, title: "Saved candidates", body: "Build a shortlist your whole hiring team can review." },
  { icon: MessagesSquare, title: "Direct messaging", body: "Reach the candidate with one click — no email back-and-forth." },
  { icon: ShieldCheck, title: "Verified employers", body: "Every recruiter is verified, so candidates trust your outreach." },
];

function CandidatesPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="For candidates & employers"
        title="Find the people who can build what's next"
        description="Browse profiles, search with precise filters, and reach out to candidates directly through Lan Pwint."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-card p-6">
              <f.icon className="h-5 w-5 text-teal" />
              <h3 className="mt-3 font-serif text-lg text-navy">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>

        {/* Browse */}
        <div className="mt-16 rounded-2xl border border-border bg-card overflow-hidden">
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

        <div className="mt-10 rounded-2xl bg-gradient-to-br from-navy to-deep p-10 text-navy-foreground">
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
    </PageShell>
  );
}
