import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PageNav } from "@/components/page-nav";
import { PageHeader, PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/candidates")({
  head: () => ({
    meta: [
      { title: "Candidates & Employers — Lan Pwint" },
      {
        name: "description",
        content:
          "Browse verified graduate profiles, filter by skills, education, and experience, and contact candidates directly.",
      },
      { property: "og:title", content: "Hire from Lan Pwint" },
      {
        property: "og:description",
        content: "Find graduates ready to work. Filter, save, and message directly.",
      },
    ],
  }),
  component: CandidatesLayout,
});

function CandidatesLayout() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="For candidates & employers"
        title="Find the people who can build what's next"
        description="Browse profiles, search with precise filters, and reach out to candidates directly through Lan Pwint."
      />
      <PageNav
        items={[
          { to: "/candidates", label: "Overview" },
          { to: "/candidates/features", label: "Features" },
          { to: "/candidates/browse", label: "Browse Candidates" },
          { to: "/candidates/recruiter-dashboard", label: "Recruiter Dashboard" },
        ]}
      />
      <Outlet />
    </PageShell>
  );
}
