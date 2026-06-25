import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/student/job-map")({
  head: () => ({ meta: [{ title: "Job Map — Lan Pwint" }] }),
  component: JobMapPage,
});

function JobMapPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.22em] text-teal">Job Map</p>
        <h1 className="mt-2 font-serif text-3xl text-navy sm:text-4xl">Available jobs across Myanmar</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Map view of open roles by city. The map renders once Google Maps is connected.
        </p>

        <div className="mt-8 grid h-[480px] place-items-center rounded-2xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
          Google Maps will load here.
        </div>
      </section>
    </PageShell>
  );
}
