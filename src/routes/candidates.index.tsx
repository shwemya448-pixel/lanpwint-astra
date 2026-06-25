import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, FileText, MapPin, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/candidates/")({
  component: EmployerOverview,
});

const CARDS = [
  { to: "/employer/jobs/new", icon: Briefcase, title: "Post a job", body: "Open roles published in minutes. Students apply with one tap." },
  { to: "/employer/job-map", icon: MapPin, title: "Drop it on the map", body: "Pin each role on the Myanmar map so candidates can find you geographically." },
  { to: "/employer/applications", icon: FileText, title: "Review applicants", body: "Student details are revealed only after they apply to your job — keeping their data private." },
  { to: "/employer/messages", icon: MessageSquare, title: "Message directly", body: "Realtime chat with candidates who reach out or apply — no email back-and-forth." },
];

function EmployerOverview() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lp-reveal">
      <div className="grid gap-6 sm:grid-cols-2 lp-reveal-stagger">
        {CARDS.map((c) => (
          <Link
            key={c.title}
            to={c.to as never}
            className="lp-card p-6 transition-all hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="h-11 w-11 rounded-xl lp-glass flex items-center justify-center text-[color:var(--gold)]">
              <c.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-serif text-2xl text-foreground">{c.title}</h2>
            <div className="mt-2 lp-divider-gold" />
            <p className="mt-3 text-muted-foreground">{c.body}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
