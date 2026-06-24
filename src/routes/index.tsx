import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, BookOpen, FileText, Users, ArrowRight } from "lucide-react";
import { useSession } from "@/lib/auth";
import { DoorScene } from "@/components/lp/DoorScene";
import { ShootingStars } from "@/components/lp/ShootingStars";
import { PortalCard, type PortalKind } from "@/components/lp/PortalCard";
import { PortalTransition } from "@/components/lp/PortalTransition";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lan Pwint — AI Academic & Career Gateway" },
      {
        name: "description",
        content:
          "Lan Pwint (လမ်းပွင့်) — AI-powered gateway for Myanmar students, graduates, and candidates: discover your passion, learn, find scholarships, build a CV, and connect with recruiters.",
      },
      { property: "og:title", content: "Lan Pwint — AI Academic & Career Gateway" },
      {
        property: "og:description",
        content: "Discover your passion, build skills, find scholarships, and launch your career.",
      },
    ],
  }),
  component: LandingPage,
});

const PORTAL_TO_ROUTE: Record<PortalKind, string> = {
  undergrad: "/undergraduate",
  grad: "/graduates",
  candidate: "/candidates",
};

function LandingPage() {
  const navigate = useNavigate();
  const { user } = useSession();
  const [chosen, setChosen] = useState<PortalKind | null>(null);
  const [transitioning, setTransitioning] = useState<PortalKind | null>(null);

  const choosePortal = (kind: PortalKind) => {
    setChosen(kind);
    if (user) setTransitioning(kind);
    else navigate({ to: "/auth", search: { as: kind === "candidate" ? "employer" : "student" } as never });
  };

  const finishTransition = () => {
    const target = PORTAL_TO_ROUTE[transitioning ?? "undergrad"];
    setTransitioning(null);
    navigate({ to: target as never }).catch(() => {});
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <ShootingStars />

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-40">
        <div className="mx-auto max-w-7xl px-3 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl lp-glass flex items-center justify-center">
              <span className="lp-gold-text text-base sm:text-lg font-bold">လ</span>
            </div>
            <div className="leading-tight min-w-0">
              <div className="lp-shimmer-text text-sm sm:text-lg font-bold tracking-wide truncate">Lan Pwint</div>
              <div className="hidden sm:block text-[10px] uppercase tracking-[0.2em] text-muted-foreground truncate">
                Academic · Career · Gateway
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/about" className="lp-ghost-btn h-10 px-3 rounded-xl hidden sm:inline-flex items-center text-sm font-semibold">About</Link>
            <Link to="/contact" className="lp-ghost-btn h-10 px-3 rounded-xl hidden sm:inline-flex items-center text-sm font-semibold">Contact</Link>
            {user ? (
              <Link to="/undergraduate" className="lp-gold-btn h-10 px-5 rounded-xl text-sm font-semibold inline-flex items-center">Dashboard</Link>
            ) : (
              <Link to="/auth" search={{ as: "student" } as never} className="lp-gold-btn h-10 px-5 rounded-xl text-sm font-semibold inline-flex items-center">Sign in</Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-24 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-5">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-8 md:gap-10 items-center lp-animate-in">
          <DoorScene />
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full lp-glass text-[10px] sm:text-xs tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5 text-[color:var(--gold)] shrink-0" />
              <span className="text-muted-foreground">AI Academic · Career · Gateway</span>
            </div>
            <h1 className="mt-5 sm:mt-6 text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
              <span className="lp-shimmer-text">Lan Pwint</span>
              <br />
              <span className="text-foreground/90">လမ်းပွင့်</span>
            </h1>
            <p className="mt-5 sm:mt-6 text-sm sm:text-lg text-muted-foreground max-w-xl leading-relaxed mx-auto md:mx-0">
              Your AI-powered gateway to passion, learning, and career.
            </p>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground/80 max-w-xl mx-auto md:mx-0">
              Academic &amp; Career Gateway for Myanmar students, graduates, and candidates.
            </p>
            <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center md:justify-start justify-center">
              <a href="#portals" className="lp-gold-btn h-12 px-7 rounded-xl text-sm font-semibold inline-flex items-center justify-center">
                Choose your portal
              </a>
              <a href="#features" className="lp-ghost-btn h-12 px-7 rounded-xl text-sm font-semibold inline-flex items-center justify-center">
                Discover the path
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Portals */}
      <section id="portals" className="relative px-4 sm:px-5 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8 sm:mb-10">
            <div className="lp-divider-gold mx-auto w-28 sm:w-32" />
            <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-bold">Choose your portal</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {(["undergrad", "grad", "candidate"] as PortalKind[]).map((k, i) => (
              <PortalCard key={k} kind={k} index={i} onChoose={choosePortal} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative px-4 sm:px-5 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10 sm:mb-12 lp-animate-in">
            <div className="lp-divider-gold mx-auto w-28 sm:w-32" />
            <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-bold">What you get</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <Feature icon={<Sparkles />} title="AI Career Mentor" desc="Personalized guidance from interests to next steps." href="/find-passion" />
            <Feature icon={<FileText />} title="CV Analyzer" desc="Get instant feedback on your CV and how to improve it." />
            <Feature icon={<BookOpen />} title="Scholarships & Learn" desc="Curated learning paths and funding opportunities." />
            <Feature icon={<Users />} title="Recruiter Board" desc="Showcase your portfolio. Be discovered by employers." />
          </div>
          <div className="mt-10 text-center">
            <Link to="/find-passion" className="lp-gold-btn h-11 px-6 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
              Try Career Discovery AI <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="px-4 sm:px-5 py-8 sm:py-10 text-center text-xs text-muted-foreground">
        <div className="lp-divider-gold mx-auto w-32 sm:w-40 mb-4" />
        © {new Date().getFullYear()} Lan Pwint · All rights reserved.
      </footer>

      {transitioning && <PortalTransition portal={transitioning} onDone={finishTransition} />}
      {chosen && null}
    </div>
  );
}

function Feature({ icon, title, desc, href }: { icon: React.ReactNode; title: string; desc: string; href?: string }) {
  const inner = (
    <div className="lp-card p-6 lp-animate-in h-full">
      <div className="h-11 w-11 rounded-xl lp-glass flex items-center justify-center text-[color:var(--gold)]">{icon}</div>
      <h3 className="mt-4 font-bold">{title}</h3>
      <div className="mt-2 lp-divider-gold" />
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
  return href ? <Link to={href as never} className="block">{inner}</Link> : inner;
}
