import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Bot, CheckCircle2, MessageSquareText, PlayCircle } from "lucide-react";
import { PageHeader, PageShell } from "@/components/page-shell";
import { PageNav } from "@/components/page-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/undergraduate")({
  head: () => ({
    meta: [
      { title: "Undergraduate — Lan Pwint" },
      {
        name: "description",
        content:
          "Internship stories, learning resources, AI career assistant, and certificate courses for undergraduate students.",
      },
      { property: "og:title", content: "Undergraduate students — Lan Pwint" },
      {
        property: "og:description",
        content: "Read real internship experiences, learn from courses, and get AI career guidance.",
      },
    ],
  }),
  component: UndergradPage,
});

const COURSES = [
  {
    title: "Career Foundations",
    description: "Self-awareness, goal setting, and the basics of a strong career start.",
    weeks: 5,
    progress: 60,
  },
  {
    title: "Professional Communication",
    description: "Email etiquette, interviews, and how to talk about your work clearly.",
    weeks: 5,
    progress: 20,
  },
  {
    title: "Workplace Readiness",
    description: "Teamwork, deadlines, feedback, and surviving your first 90 days.",
    weeks: 5,
    progress: 0,
  },
];

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

function UndergradPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="For undergraduate students"
        title="Prepare for the career that's coming next"
        description="Learn from real internship experiences. Track your progress through structured courses. Ask the AI career assistant anything you don't understand."
      />
      <PageNav items={[
        { id: "ai-assistant", label: "AI Career Assistant" },
        { id: "learning-center", label: "Learning Center" },
        { id: "internship-stories", label: "Internship Stories" },
      ]} />

      {/* AI Assistant */}
      <section id="ai-assistant" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-2xl border border-border bg-card p-8 lg:grid-cols-5 lg:p-12">
          <div className="lg:col-span-3">
            <Badge variant="secondary" className="bg-teal/15 text-teal hover:bg-teal/20">
              <Bot className="mr-1 h-3 w-3" /> AI Career Assistant
            </Badge>
            <h2 className="mt-4 font-serif text-3xl text-navy">
              Ask anything. Get clear, career-specific answers.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Confused about a topic from class? Wondering which skill to learn next? Curious how internships at
              different companies compare? Your AI assistant is built to guide students like you.
            </p>
            <div className="mt-6">
              <Button asChild className="bg-navy text-navy-foreground hover:bg-deep">
                <Link to="/auth" search={{ as: "student" }}>
                  <MessageSquareText className="mr-2 h-4 w-4" /> Open the assistant
                </Link>
              </Button>
            </div>
          </div>
          <div className="rounded-xl bg-muted p-5 lg:col-span-2">
            <div className="space-y-3 text-sm">
              <ChatBubble who="user">What should I learn before a UX internship?</ChatBubble>
              <ChatBubble who="ai">
                Start with the basics of user research, then practice 2–3 wireframing tools. I can sketch out a 4-week
                prep plan — want me to?
              </ChatBubble>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Center */}
      <section id="learning-center" className="bg-muted/40 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-teal">Learning center</p>
              <h2 className="mt-3 font-serif text-3xl text-navy sm:text-4xl">3 courses · 5 weekly lessons each</h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Complete lessons, pass the final assessment, and earn a downloadable certificate of completion.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/auth" search={{ as: "student" }}>Browse all courses</Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {COURSES.map((c) => (
              <div key={c.title} className="flex flex-col rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-teal">
                  <BookOpen className="h-3.5 w-3.5" /> {c.weeks} lessons
                </div>
                <h3 className="mt-3 font-serif text-xl text-navy">{c.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{c.description}</p>
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{c.progress}%</span>
                  </div>
                  <Progress value={c.progress} className="mt-2 h-1.5" />
                </div>
                <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal" /> Certificate on completion
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internship stories */}
      <section id="internship-stories" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
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
    </PageShell>
  );
}

function ChatBubble({ who, children }: { who: "user" | "ai"; children: React.ReactNode }) {
  const isUser = who === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          isUser
            ? "max-w-[85%] rounded-2xl rounded-tr-sm bg-navy px-4 py-2.5 text-navy-foreground"
            : "max-w-[85%] rounded-2xl rounded-tl-sm bg-card px-4 py-2.5 text-foreground border border-border"
        }
      >
        {children}
      </div>
    </div>
  );
}
