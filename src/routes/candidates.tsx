import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PageNav } from "@/components/page-nav";
import { PageHeader, PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/candidates")({
  head: () => ({
    meta: [
      { title: "For Employers — Lan Pwint" },
      {
        name: "description",
        content:
          "Post jobs, map your hiring across Myanmar, browse the student CV board, and message candidates — all from one employer workspace.",
      },
      { property: "og:title", content: "Hire on Lan Pwint" },
      {
        property: "og:description",
        content: "Post roles, pin them on the map, find verified student CVs, and message directly.",
      },
    ],
  }),
  component: EmployersLayout,
});

function EmployersLayout() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="For employers"
        title="Hire the next generation of Myanmar talent"
        description="Post jobs, drop them on the map so students can find you, browse the CV board, and start a conversation in one click."
      />
      <PageNav
        items={[
          { to: "/candidates", label: "Overview" },
          { to: "/candidates/features", label: "What you get" },
          { to: "/candidates/browse", label: "How CV Board works" },
          { to: "/candidates/recruiter-dashboard", label: "Open employer workspace" },
        ]}
      />
      <Outlet />
    </PageShell>
  );
}
