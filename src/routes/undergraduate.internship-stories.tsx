import { createFileRoute, Link } from "@tanstack/react-router";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/undergraduate/internship-stories")({
  head: () => ({
    meta: [
      { title: "Internship Stories — Lan Pwint" },
      {
        name: "description",
        content: "Honest internship stories from real students — what worked, what didn't, and what to expect.",
      },
    ],
  }),
  component: InternshipStoriesPage,
});

const STORIES = [
  {
    author: "Hsu Myat",
    role: "UX Intern · Fintech",
    excerpt:
      "The first week felt overwhelming, but pairing up with a senior designer changed everything. Here's what I learned about asking the right questions...",
  },
  {
    author: "Aung Min",
    role: "Backend Intern · E-commerce",
    excerpt:
      "I thought internships were about coding all day. They're really about reading other people's code, writing docs, and learning how teams ship.",
  },
  {
    author: "Nilar",
    role: "Marketing Intern · NGO",
    excerpt:
      "Three things I wish someone told me on day one: take notes in meetings, ask for feedback weekly, and over-communicate progress.",
  },
];

function InternshipStoriesPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-teal">Internship stories</p>
          <h2 className="mt-3 font-serif text-3xl text-navy sm:text-4xl">Real workplaces. Real lessons.</h2>
        </div>
        <Button asChild variant="ghost">
          <Link to="/auth" search={{ as: "student" }}>Share your story</Link>
        </Button>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {STORIES.map((s) => (
          <article key={s.author} className="rounded-2xl border border-border bg-card p-6">
            <PlayCircle className="h-5 w-5 text-teal" />
            <p className="mt-4 font-serif text-lg text-navy leading-snug">"{s.excerpt}"</p>
            <div className="mt-5 text-sm">
              <div className="font-medium">{s.author}</div>
              <div className="text-muted-foreground">{s.role}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
