import { createFileRoute, Link } from "@tanstack/react-router";
import { FileSearch, MessageCircle, Sparkles, UserCircle2 } from "lucide-react";
import { PageNav } from "@/components/page-nav";
import { PageHeader, PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/graduates")({
  head: () => ({
    meta: [
      { title: "Graduates — Lan Pwint" },
      {
        name: "description",
        content:
          "AI CV analysis, professional job-seeking profiles, and direct connection with verified employers.",
      },
      { property: "og:title", content: "Graduates — Lan Pwint" },
      {
        property: "og:description",
        content: "Build a job-seeking profile employers can find and contact.",
      },
    ],
  }),
  component: GraduatesPage,
});

const CV_FEEDBACK = [
  { label: "Formatting", score: "Strong" },
  { label: "Skills clarity", score: "Improve" },
  { label: "Impact statements", score: "Good" },
  { label: "Keywords for ATS", score: "Improve" },
];

function GraduatesPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="For graduates"
        title="Get hired faster, with help that's actually useful"
        description="Analyze your CV with AI, build a professional job-seeking post, and let verified employers find you directly."
      />
      <PageNav items={[
        { id: "cv-analyzer", label: "CV Analyzer" },
        { id: "profile", label: "Job-Seeking Profile" },
        { id: "messaging", label: "Messaging" },
      ]} />

      {/* CV Analyzer */}
      <section id="cv-analyzer" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Badge variant="secondary" className="bg-teal/15 text-teal hover:bg-teal/20">
              <FileSearch className="mr-1 h-3 w-3" /> AI CV Analyzer
            </Badge>
            <h2 className="mt-4 font-serif text-3xl text-navy">
              Upload your CV. Get honest feedback in seconds.
            </h2>
            <p className="mt-3 text-muted-foreground">
              We review formatting, skills, strengths, weaknesses, and give targeted improvement suggestions — so the
              first impression you make on employers is the right one.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="bg-navy text-navy-foreground hover:bg-deep">
                <Link to="/auth" search={{ as: "student" }}>Analyze my CV</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/auth" search={{ as: "student" }}>Create a profile</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Sample analysis</div>
              <Sparkles className="h-4 w-4 text-teal" />
            </div>
            <ul className="mt-4 divide-y divide-border">
              {CV_FEEDBACK.map((f) => (
                <li key={f.label} className="flex items-center justify-between py-3 text-sm">
                  <span>{f.label}</span>
                  <span className={f.score === "Improve" ? "text-destructive font-medium" : "text-teal font-medium"}>
                    {f.score}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Profile */}
      <section id="profile" className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-teal">Job-seeking profile</p>
              <h2 className="mt-3 font-serif text-3xl text-navy sm:text-4xl">
                One profile. Visible to every verified employer.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Showcase your education, skills, experience, and the role you want next. Employers searching for
                candidates with your skills will find your profile and reach out directly.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Highlight education, skills, and experience",
                  "Specify your desired role and availability",
                  "Receive direct messages from verified employers",
                  "Update your profile any time you want",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <SampleProfile />
          </div>
        </div>
      </section>

      {/* Messaging */}
      <section id="messaging" className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <MessageCircle className="mx-auto h-6 w-6 text-teal" />
        <h2 className="mt-4 font-serif text-3xl text-navy">Direct messaging with employers</h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          No middlemen, no lost emails. When an employer is interested, the conversation happens right here.
        </p>
        <div className="mt-8">
          <Button asChild size="lg" className="bg-navy text-navy-foreground hover:bg-deep">
            <Link to="/auth" search={{ as: "student" }}>Get started as a graduate</Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}

function SampleProfile() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="bg-gradient-to-br from-navy to-deep p-6 text-navy-foreground">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-mist text-navy">
            <UserCircle2 className="h-8 w-8" />
          </div>
          <div>
            <div className="font-serif text-xl">May Thandar</div>
            <div className="text-sm opacity-80">B.Sc. Computer Science · Open to work</div>
          </div>
        </div>
      </div>
      <div className="space-y-4 p-6 text-sm">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Looking for</div>
          <div className="mt-1 font-medium">Junior Frontend Developer (Remote / Yangon)</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Skills</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["React", "TypeScript", "Tailwind", "Figma", "REST APIs"].map((s) => (
              <span key={s} className="rounded-full bg-muted px-2.5 py-1 text-xs">{s}</span>
            ))}
          </div>
        </div>
        <Button size="sm" className="w-full bg-navy text-navy-foreground hover:bg-deep">
          Contact candidate
        </Button>
      </div>
    </div>
  );
}
