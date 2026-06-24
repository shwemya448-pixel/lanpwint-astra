import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Briefcase,
  FileSearch,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lan Pwint (လမ်းပွင့်) — Open the road to your career" },
      {
        name: "description",
        content:
          "Helping students and graduates build successful careers through learning, internships, and employment opportunities.",
      },
      { property: "og:title", content: "Lan Pwint — Open the road to your career" },
      {
        property: "og:description",
        content:
          "Learning resources, internship stories, AI career guidance, and recruitment — all in one place.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <PageShell>
      <Hero />
      <Pathways />
      <Features />
      <Stats />
      <CallToAction />
    </PageShell>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-24">
        <div className="lg:col-span-6 flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.22em] text-teal">
            Careers · Learning · Recruitment
          </p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-navy sm:text-6xl lg:text-7xl">
            Lan Pwint
            <span className="block text-2xl text-deep mt-2 sm:text-3xl">လမ်းပွင့်</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Helping students and graduates build successful careers through learning, internships, and
            employment opportunities.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-navy text-navy-foreground hover:bg-deep">
              <Link to="/auth" search={{ as: "student" }}>
                <GraduationCap className="mr-2 h-4 w-4" />
                Login as Student
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-navy text-navy hover:bg-navy hover:text-navy-foreground">
              <Link to="/auth" search={{ as: "employer" }}>
                <Briefcase className="mr-2 h-4 w-4" />
                Login as Candidate / Employer
              </Link>
            </Button>
          </div>
          <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-teal" /> Secure platform
            </div>
            <div className="hidden h-1 w-1 rounded-full bg-muted-foreground/50 sm:block" />
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal" /> AI-powered guidance
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 relative">
          <div className="relative overflow-hidden rounded-2xl bg-navy shadow-lift grain">
            <img
              src={heroImage}
              alt="An open gateway facing the sunrise — symbolizing the career journey ahead."
              width={1280}
              height={1280}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden rounded-xl bg-background hairline p-4 shadow-soft sm:block">
            <p className="text-[11px] uppercase tracking-[0.18em] text-teal">Live this month</p>
            <p className="mt-1 font-serif text-2xl text-navy">240+ graduates hired</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const PATHWAYS = [
  {
    icon: BookOpen,
    title: "Undergraduate Students",
    description:
      "Internship stories, learning resources, AI career assistant, and a learning center with certificates on completion.",
    to: "/undergraduate" as const,
    cta: "Start learning",
  },
  {
    icon: GraduationCap,
    title: "Graduates",
    description:
      "Get your CV analyzed by AI, build a professional job-seeking profile, and connect directly with employers.",
    to: "/graduates" as const,
    cta: "Build my profile",
  },
  {
    icon: Briefcase,
    title: "Candidates / Employers",
    description:
      "Browse graduate profiles, filter by skills, education, and experience, and reach out to candidates directly.",
    to: "/candidates" as const,
    cta: "Find talent",
  },
];

function Pathways() {
  return (
    <section className="border-t border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-teal">Choose your road</p>
            <h2 className="mt-3 font-serif text-3xl text-navy sm:text-4xl">
              Three paths, one platform
            </h2>
          </div>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {PATHWAYS.map((p) => (
            <Link
              key={p.title}
              to={p.to}
              className="group relative flex flex-col rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-0.5 hover:border-teal hover:shadow-lift"
            >
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-navy text-navy-foreground">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-serif text-2xl text-navy">{p.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
              <span className="mt-6 inline-flex items-center text-sm font-medium text-teal">
                {p.cta} <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: Bot, title: "AI Career Assistant", body: "Conversational answers to career questions, concepts, and what-to-learn-next guidance." },
  { icon: BookOpen, title: "Learning Center", body: "3 courses · 5 weekly lessons each · progress tracking · final assessment · downloadable certificate." },
  { icon: FileSearch, title: "AI CV Analyzer", body: "Upload your CV. Get instant feedback on formatting, skills, strengths, weaknesses, and suggestions." },
  { icon: Users, title: "Talent Marketplace", body: "Graduates post professional profiles. Employers filter, save, and message qualified candidates." },
  { icon: Sparkles, title: "Internship Stories", body: "Read and share real internship experiences and workplace tips from peers and seniors." },
  { icon: ShieldCheck, title: "Verified Employers", body: "Recruiters are verified before contacting graduates, keeping the platform safe and trustworthy." },
];

function Features() {
  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.22em] text-teal">What you get</p>
          <h2 className="mt-3 font-serif text-3xl text-navy sm:text-4xl">
            Everything a career journey needs — in one place
          </h2>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex flex-col gap-3 bg-card p-7">
              <f.icon className="h-5 w-5 text-teal" />
              <h3 className="font-serif text-lg text-navy">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STATS = [
  { value: "5,200+", label: "Students learning" },
  { value: "320", label: "Graduate profiles" },
  { value: "140", label: "Verified employers" },
  { value: "92%", label: "Course completion" },
];

function Stats() {
  return (
    <section className="bg-navy text-navy-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="font-serif text-5xl leading-none text-mist">{s.value}</div>
              <div className="mt-3 text-xs uppercase tracking-[0.18em] opacity-80">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl text-navy sm:text-4xl">
          The road opens here.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Whether you're learning, looking for a job, or hiring — Lan Pwint connects the right people at
          the right moment.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="bg-navy text-navy-foreground hover:bg-deep">
            <Link to="/auth" search={{ as: "student" }}>Create a student account</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/auth" search={{ as: "employer" }}>Sign in as employer</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
