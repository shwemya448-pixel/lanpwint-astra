import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, MapPin, MessageSquare, ShieldCheck, Sparkles, Users } from "lucide-react";

export const Route = createFileRoute("/candidates/features")({
  head: () => ({ meta: [{ title: "What you get — Employers — Lan Pwint" }] }),
  component: FeaturesPage,
});

const FEATURES = [
  { icon: Briefcase, title: "Unlimited job posts", body: "Title, salary, requirements, deadline — published the moment you click." },
  { icon: MapPin, title: "Map your hiring", body: "Each role auto-pins to its city so students can browse jobs near them." },
  { icon: Users, title: "Verified student CVs", body: "University, year, skills, downloadable CV — refreshed daily." },
  { icon: MessageSquare, title: "Realtime messaging", body: "Chat with candidates inside Lan Pwint. Threads sync instantly." },
  { icon: Sparkles, title: "AI-screened CVs", body: "Students arrive with AI-rated CVs, so you skip the spam." },
  { icon: ShieldCheck, title: "Verified employer profile", body: "A trust badge on every post so candidates respond to your outreach." },
];

function FeaturesPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lp-reveal">
      <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3 lp-reveal-stagger">
        {FEATURES.map((f) => (
          <div key={f.title} className="bg-card p-6 transition-colors hover:bg-card/70">
            <div className="h-10 w-10 rounded-xl lp-glass flex items-center justify-center text-[color:var(--gold)]">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-serif text-lg text-foreground">{f.title}</h3>
            <div className="mt-2 lp-divider-gold" />
            <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
