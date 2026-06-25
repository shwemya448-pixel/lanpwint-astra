import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, MessagesSquare, Search, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/candidates/")({
  component: CandidatesOverview,
});

const CARDS = [
  { to: "/candidates/features", icon: Search, title: "Features", body: "What the recruiting platform gives you." },
  { to: "/candidates/browse", icon: Bookmark, title: "Browse Candidates", body: "Search and save graduate profiles." },
  { to: "/candidates/recruiter-dashboard", icon: MessagesSquare, title: "Recruiter Dashboard", body: "Manage shortlists and conversations." },
  { to: "/candidates", icon: ShieldCheck, title: "Verified employers", body: "Every recruiter on Lan Pwint is verified." },
];

function CandidatesOverview() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-6 sm:grid-cols-2">
        {CARDS.map((c) => (
          <Link
            key={c.title}
            to={c.to as never}
            className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-soft"
          >
            <c.icon className="h-6 w-6 text-teal" />
            <h2 className="mt-4 font-serif text-2xl text-navy">{c.title}</h2>
            <p className="mt-2 text-muted-foreground">{c.body}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
