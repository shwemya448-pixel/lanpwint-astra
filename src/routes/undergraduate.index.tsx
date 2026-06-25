import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Bot, FileSearch, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/undergraduate/")({
  component: UndergradOverview,
});

const CARDS = [
  {
    to: "/undergraduate/ai-assistant",
    icon: Bot,
    title: "AI Career Assistant",
    body: "Ask anything about your career path and get instant, student-friendly answers.",
  },
  {
    to: "/undergraduate/learning-center",
    icon: BookOpen,
    title: "Learning Center",
    body: "Three structured courses with weekly lessons and certificates on completion.",
  },
  {
    to: "/undergraduate/internship-stories",
    icon: PlayCircle,
    title: "Internship Stories",
    body: "Real workplaces, honest lessons, and tips from students who came before you.",
  },
  {
    to: "/find-passion",
    icon: FileSearch,
    title: "Find Your Passion",
    body: "Short quizzes that help you discover what kind of work could fit you best.",
  },
];

function UndergradOverview() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-6 sm:grid-cols-2">
        {CARDS.map((c) => (
          <Link
            key={c.to}
            to={c.to as never}
            className="group rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-soft"
          >
            <c.icon className="h-6 w-6 text-teal" />
            <h2 className="mt-4 font-serif text-2xl text-navy">{c.title}</h2>
            <p className="mt-2 text-muted-foreground">{c.body}</p>
            <Button variant="ghost" className="mt-4 px-0 text-navy dark:text-mist">
              Open →
            </Button>
          </Link>
        ))}
      </div>
    </section>
  );
}
