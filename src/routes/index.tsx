import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, BookOpen, FileText, Users, ArrowRight, Newspaper } from "lucide-react";
import { useSession } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useLocale } from "@/lib/i18n";
import { DoorScene } from "@/components/lp/DoorScene";
import { ShootingStars } from "@/components/lp/ShootingStars";
import { PortalCard, type PortalKind } from "@/components/lp/PortalCard";
import { PortalTransition } from "@/components/lp/PortalTransition";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lan Pwint — AI Career Gateway" },
      {
        name: "description",
        content:
          "Lan Pwint (လမ်းပွင့်) — AI-powered gateway for Myanmar candidates, graduates, and employers: discover your passion, learn, find scholarships, build a CV, and connect with recruiters.",
      },
      { property: "og:title", content: "Lan Pwint — AI Career Gateway" },
      {
        property: "og:description",
        content: "Discover your passion, build skills, find scholarships, and launch your career.",
      },
    ],
  }),
  component: LandingPage,
});

const PORTAL_TO_ROUTE: Record<PortalKind, string> = {
  student: "/student/dashboard",
  candidate: "/employer/dashboard",
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
    const target = PORTAL_TO_ROUTE[transitioning ?? "student"];
    setTransitioning(null);
    navigate({ to: target as never }).catch(() => {});
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col">
      <ShootingStars />
      <SiteHeader />

      {/* Hero */}
      <section className="relative pt-10 sm:pt-14 pb-12 sm:pb-16 px-4 sm:px-5">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-8 md:gap-10 items-center lp-animate-in">
          <DoorScene />
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full lp-glass text-[10px] sm:text-xs tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5 text-[color:var(--gold)] shrink-0" />
              <span className="text-muted-foreground">AI Career · Compass · Gateway</span>
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
              Career Gateway for Myanmar candidates, graduates, and employers.
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
          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6 max-w-3xl mx-auto">
            {(["student", "candidate"] as PortalKind[]).map((k, i) => (
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

      <NewsPreview />

      <SiteFooter />


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
