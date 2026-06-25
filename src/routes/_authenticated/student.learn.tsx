import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/learn")({
  head: () => ({ meta: [{ title: "Learn & Earn — Lan Pwint" }] }),
  component: LearnPage,
});

type Video = { id: string; title: string; channel: string };
type Category = { key: string; label: string; description: string; videos: Video[] };

// Curated public YouTube videos — embedded directly, no API key needed.
const CATEGORIES: Category[] = [
  {
    key: "interview",
    label: "Interview Tips",
    description: "Ace interviews with proven frameworks and examples.",
    videos: [
      { id: "HG68Ymazo18", title: "How to Succeed in Your Job Interview", channel: "Indeed" },
      { id: "PCWVi5pAa30", title: "Top Interview Tips: Common Questions", channel: "Indeed" },
      { id: "naIkpQ_cIt0", title: "Tell Me About Yourself — A Good Answer", channel: "Linda Raynier" },
      { id: "kayOhGRcNt4", title: "STAR Method for Behavioral Interviews", channel: "Jeff Su" },
    ],
  },
  {
    key: "cv",
    label: "CV & Resume",
    description: "Build a CV that recruiters actually read.",
    videos: [
      { id: "y8YH0Qbu5h4", title: "Write an Incredible Resume: 5 Golden Rules", channel: "Jeff Su" },
      { id: "u3FrxXVejQU", title: "How to Write a CV — Step by Step", channel: "Standout CV" },
      { id: "Tt08KmFfIYQ", title: "Resume Mistakes to Avoid", channel: "Linda Raynier" },
    ],
  },
  {
    key: "tech",
    label: "Tech Careers",
    description: "Paths into software, data, and product.",
    videos: [
      { id: "MTPsmOXBrCY", title: "How to Become a Software Engineer", channel: "Mayuko" },
      { id: "vLnPwxZdW4Y", title: "What is Data Science?", channel: "freeCodeCamp" },
      { id: "n9wTcVG0Mtc", title: "Day in the Life of a Software Engineer", channel: "TechLead" },
    ],
  },
  {
    key: "business",
    label: "Business & Finance",
    description: "Foundations of business, finance, and entrepreneurship.",
    videos: [
      { id: "WEDIj9JBTC8", title: "Financial Literacy for Beginners", channel: "The Plain Bagel" },
      { id: "WS7DAtgkc8c", title: "How to Start a Business", channel: "Entrepreneur" },
      { id: "kCeDxctCerQ", title: "Marketing 101 — Basics", channel: "GaryVee" },
    ],
  },
  {
    key: "freelance",
    label: "Freelancing",
    description: "Find clients and run a freelance career.",
    videos: [
      { id: "kWFidwM7g-Y", title: "How to Start Freelancing (Beginner Guide)", channel: "Charli Marie" },
      { id: "Q9wWX9bM0wo", title: "Upwork Tips for New Freelancers", channel: "Alex Berman" },
    ],
  },
  {
    key: "english",
    label: "English for Work",
    description: "Speak confidently in meetings, emails, and interviews.",
    videos: [
      { id: "QnoQiSwAJaE", title: "Business English — Meetings", channel: "BBC Learning English" },
      { id: "lEFu7b6f7zM", title: "Professional Email Writing", channel: "Learn English with Emma" },
      { id: "EmTm-7-zJfs", title: "English for Job Interviews", channel: "Speak Confident English" },
    ],
  },
];

function LearnPage() {
  const [activeKey, setActiveKey] = useState(CATEGORIES[0].key);
  const active = CATEGORIES.find((c) => c.key === activeKey) ?? CATEGORIES[0];

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.22em] text-teal">Learn &amp; Earn</p>
        <h1 className="mt-2 font-serif text-3xl text-navy sm:text-4xl">Career videos, by category</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Hand-picked YouTube videos for each skill. Pick a category and watch right here — no sign-up,
          no API needed.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setActiveKey(c.key)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition",
                activeKey === c.key
                  ? "border-teal bg-teal text-white"
                  : "border-border bg-card text-navy hover:border-teal/60",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm text-muted-foreground">{active.description}</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {active.videos.map((v) => (
            <article
              key={v.id}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              <div className="aspect-video w-full bg-black">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${v.id}?rel=0&modestbranding=1`}
                  title={v.title}
                  loading="lazy"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-4">
                <h3 className="font-serif text-lg text-navy">{v.title}</h3>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                  {v.channel}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
