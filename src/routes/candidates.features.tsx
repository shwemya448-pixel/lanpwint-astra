import { createFileRoute } from "@tanstack/react-router";
import { Bookmark, MessagesSquare, Search, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/candidates/features")({
  head: () => ({ meta: [{ title: "Features — Candidates — Lan Pwint" }] }),
  component: FeaturesPage,
});

const FEATURES = [
  { icon: Search, title: "Powerful search", body: "Filter by skill, education, location, and years of experience." },
  { icon: Bookmark, title: "Saved candidates", body: "Build a shortlist your whole hiring team can review." },
  { icon: MessagesSquare, title: "Direct messaging", body: "Reach the candidate with one click — no email back-and-forth." },
  { icon: ShieldCheck, title: "Verified employers", body: "Every recruiter is verified, so candidates trust your outreach." },
];

function FeaturesPage() {
  return (
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
    </section>
  );
}
