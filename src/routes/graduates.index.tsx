import { createFileRoute, Link } from "@tanstack/react-router";
import { FileSearch, MessageCircle, UserCircle2 } from "lucide-react";

export const Route = createFileRoute("/graduates/")({
  component: GraduatesOverview,
});

const CARDS = [
  { to: "/graduates/cv-analyzer", icon: FileSearch, title: "CV Analyzer", body: "Upload your CV and get honest, AI-powered feedback in seconds." },
  { to: "/graduates/profile", icon: UserCircle2, title: "Job-Seeking Profile", body: "One profile that every verified employer can find and contact." },
  { to: "/graduates/messaging", icon: MessageCircle, title: "Messaging", body: "Talk directly to employers — no middlemen, no lost emails." },
];

function GraduatesOverview() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((c) => (
          <Link
            key={c.to}
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
