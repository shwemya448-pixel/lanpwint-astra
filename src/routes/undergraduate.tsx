import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PageHeader, PageShell } from "@/components/page-shell";
import { PageNav } from "@/components/page-nav";

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
  component: UndergradLayout,
});

function UndergradLayout() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="For undergraduate students"
        title="Prepare for the career that's coming next"
        description="Learn from real internship experiences. Track your progress through structured courses. Ask the AI career assistant anything you don't understand."
      />
      <PageNav
        items={[
          { to: "/undergraduate", label: "Overview" },
          { to: "/undergraduate/ai-assistant", label: "AI Career Assistant" },
          { to: "/undergraduate/learning-center", label: "Learning Center" },
          { to: "/undergraduate/internship-stories", label: "Internship Stories" },
        ]}
      />
      <Outlet />
    </PageShell>
  );
}
