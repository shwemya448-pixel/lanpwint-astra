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
          "Post jobs, map your hiring across Myanmar, browse the candidate CV board, and message candidates — all from one employer workspace.",
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
        description="Post jobs, drop them on the map so candidates can find you, and start a conversation as soon as a candidate applies."
      />
      <PageNav
        items={[
          { to: "/candidates", label: "Overview" },
          { to: "/candidates/features", label: "What you get" },
          { to: "/candidates/recruiter-dashboard", label: "Open employer workspace" },
        ]}
      />
      <Outlet />
    </PageShell>
  );
}
