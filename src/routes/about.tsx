import { createFileRoute } from "@tanstack/react-router";
import { Compass, HeartHandshake, Sparkles } from "lucide-react";
import { PageHeader, PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Lan Pwint" },
      {
        name: "description",
        content:
          "Lan Pwint (လမ်းပွင့်) is a career development platform helping students learn from real internship experiences, supporting graduates in finding jobs, and helping employers discover talented candidates.",
      },
      { property: "og:title", content: "About Lan Pwint" },
      { property: "og:description", content: "Our mission: open the road to better careers." },
    ],
  }),
  component: About,
});

const VALUES = [
  {
    icon: Compass,
    title: "Guidance, not guessing",
    body: "We replace career confusion with structured learning, mentorship from real experiences, and AI-powered guidance.",
  },
  {
    icon: HeartHandshake,
    title: "Built for both sides",
    body: "Graduates get visibility. Employers get verified talent. Both sides benefit from honest, direct conversation.",
  },
  {
    icon: Sparkles,
    title: "Practical first",
    body: "Every course, story, and tool exists to move someone one step closer to their next career milestone.",
  },
];

function About() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="About us"
        title="Open the road to a better career"
        description="Lan Pwint (လမ်းပွင့်) is a career development platform dedicated to helping undergraduate students learn from real internship experiences, supporting graduates in finding employment opportunities, and enabling employers to discover talented candidates efficiently."
      />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="text-xs uppercase tracking-[0.22em] text-teal">Our mission</p>
            <h2 className="mt-3 font-serif text-3xl text-navy">Bridging students, graduates, and employers</h2>
          </div>
          <div className="space-y-5 text-muted-foreground leading-relaxed lg:col-span-3">
            <p>
              Too many capable students enter the job market without a clear understanding of what employers want — and
              too many great employers struggle to find the right people. Lan Pwint exists to close that gap.
            </p>
            <p>
              We bring together learning resources, peer internship experiences, AI-powered career guidance, and a
              trusted recruitment marketplace, so the road from classroom to first job — and beyond — feels open and
              walkable.
            </p>
          </div>
        </div>

        <div className="mt-20 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="bg-card p-7">
              <v.icon className="h-5 w-5 text-teal" />
              <h3 className="mt-4 font-serif text-lg text-navy">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
