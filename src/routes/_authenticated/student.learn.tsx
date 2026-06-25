import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/student/learn")({
  head: () => ({ meta: [{ title: "Learn & Earn — Lan Pwint" }] }),
  component: LearnPage,
});

type Video = { id: string; title: string; channel: string };
type Category = { key: string; label: string; description: string; videos: Video[] };

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
      { id: "1mHjMNZZvFo", title: "How to answer 'What are your weaknesses?'", channel: "Linda Raynier" },
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
      { id: "Qjz4nzCkBVQ", title: "LinkedIn Profile Tips", channel: "Jeff Su" },
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
      { id: "ZsK4VRZ-NyM", title: "Frontend vs Backend vs Fullstack", channel: "Programming with Mosh" },
    ],
  },
  {
    key: "design",
    label: "Design & Creative",
    description: "UI/UX, graphic design, and creative careers.",
    videos: [
      { id: "c9Wg6Cb_YlU", title: "Intro to UX Design", channel: "AJ&Smart" },
      { id: "DwGAyR-Iaa0", title: "Figma Tutorial for Beginners", channel: "DesignCourse" },
      { id: "vbS92fxRJBI", title: "How to Build a Design Portfolio", channel: "The Futur" },
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
      { id: "yfoY53QXEnI", title: "Excel for Beginners", channel: "Kevin Stratvert" },
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
  {
    key: "data",
    label: "Data & Analytics",
    description: "SQL, spreadsheets, dashboards, and analyst careers.",
    videos: [
      { id: "HXV3zeQKqGY", title: "SQL Tutorial — Full Course", channel: "freeCodeCamp" },
      { id: "Y17SH18-rzo", title: "Become a Data Analyst", channel: "Alex The Analyst" },
      { id: "_9LX9HSQkWo", title: "Tableau in 20 Minutes", channel: "Edureka" },
    ],
  },
  {
    key: "ai",
    label: "AI & Machine Learning",
    description: "Get started with modern AI and ML tools.",
    videos: [
      { id: "JMUxmLyrhSk", title: "AI Explained for Beginners", channel: "Fireship" },
      { id: "aircAruvnKk", title: "But what is a neural network?", channel: "3Blue1Brown" },
      { id: "jPluSXJpdrA", title: "Prompt Engineering Crash Course", channel: "DeepLearning.AI" },
    ],
  },
  {
    key: "marketing",
    label: "Marketing & Social",
    description: "Digital marketing, content, and social media.",
    videos: [
      { id: "bixR-KIJKYM", title: "Digital Marketing Course", channel: "Simplilearn" },
      { id: "QDPas9YxBKM", title: "Social Media Strategy", channel: "HubSpot" },
      { id: "Pf8aHGzjF8M", title: "SEO for Beginners", channel: "Ahrefs" },
    ],
  },
  {
    key: "productivity",
    label: "Productivity & Study",
    description: "Study hacks, focus, and time management.",
    videos: [
      { id: "tT9SjPQc9Hc", title: "How to Study Smart, Not Hard", channel: "Justin Sung" },
      { id: "iONDebHX9qk", title: "How I Manage My Time", channel: "Ali Abdaal" },
      { id: "5Y1S2eO6Vh0", title: "Pomodoro Technique Explained", channel: "Thomas Frank" },
    ],
  },
  {
    key: "softskills",
    label: "Soft Skills",
    description: "Communication, leadership, and emotional intelligence.",
    videos: [
      { id: "Ks-_Mh1QhMc", title: "Your Body Language Shapes Who You Are", channel: "TED" },
      { id: "8KGVFbWcgcM", title: "How to Speak Confidently in Public", channel: "TEDx" },
      { id: "F6kVxFh3kEE", title: "Active Listening Skills", channel: "Communication Coach" },
    ],
  },
];

function LearnPage() {
  const [activeKey, setActiveKey] = useState(CATEGORIES[0].key);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const cat = CATEGORIES.find((c) => c.key === activeKey) ?? CATEGORIES[0];
    if (!q.trim()) return cat;
    const needle = q.toLowerCase();
    return {
      ...cat,
      videos: cat.videos.filter(
        (v) => v.title.toLowerCase().includes(needle) || v.channel.toLowerCase().includes(needle),
      ),
    };
  }, [activeKey, q]);

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lp-reveal">
        <p className="text-xs uppercase tracking-[0.22em] page-gold">Learn &amp; Earn</p>
        <h1 className="mt-2 font-serif text-3xl text-navy sm:text-4xl">Career videos, by category</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Hand-picked YouTube videos for each skill. Pick a category and watch right here — no sign-up needed.
        </p>

        <div className="mt-6 max-w-md relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search videos in this category…"
            className="pl-9"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2 lp-reveal-stagger">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => { setActiveKey(c.key); setQ(""); }}
              className={cn(
                "rounded-full border px-4 py-2 text-sm",
                activeKey === c.key
                  ? "border-[color:var(--gold)] bg-[color:var(--gold-soft)] text-foreground"
                  : "bg-card text-foreground/80 hover:text-foreground",
              )}
            >
              {c.label}
              <span className="ml-2 text-[10px] opacity-70">{c.videos.length}</span>
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm text-muted-foreground">{filtered.description}</p>

        <div key={activeKey + q} className="mt-6 grid gap-6 lg:grid-cols-2 lp-reveal-stagger">
          {filtered.videos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No videos match your search.</p>
          ) : (
            filtered.videos.map((v) => (
              <article
                key={v.id}
                className="overflow-hidden rounded-2xl border bg-card shadow-sm"
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
                  <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{v.channel}</p>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </PageShell>
  );
}
