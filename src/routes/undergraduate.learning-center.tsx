import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/undergraduate/learning-center")({
  head: () => ({
    meta: [
      { title: "Learning Center — Lan Pwint" },
      {
        name: "description",
        content: "Structured career courses with weekly lessons and downloadable certificates of completion.",
      },
    ],
  }),
  component: LearningCenterPage,
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

function LearningCenterPage() {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
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
  );
}
