import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PageNav } from "@/components/page-nav";
import { PageHeader, PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/graduates")({
  head: () => ({
    meta: [
      { title: "Graduates — Lan Pwint" },
      {
        name: "description",
        content:
          "AI CV analysis, professional job-seeking profiles, and direct connection with verified employers.",
      },
      { property: "og:title", content: "Graduates — Lan Pwint" },
      {
        property: "og:description",
        content: "Build a job-seeking profile employers can find and contact.",
      },
    ],
  }),
  component: GraduatesLayout,
});

function GraduatesLayout() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="For graduates"
        title="Get hired faster, with help that's actually useful"
        description="Analyze your CV with AI, build a professional job-seeking post, and let verified employers find you directly."
      />
      <PageNav
        items={[
          { to: "/graduates", label: "Overview" },
          { to: "/graduates/cv-analyzer", label: "CV Analyzer" },
          { to: "/graduates/profile", label: "Job-Seeking Profile" },
          { to: "/graduates/messaging", label: "Messaging" },
        ]}
      />
      <Outlet />
    </PageShell>
  );
}
