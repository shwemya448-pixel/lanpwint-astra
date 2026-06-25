import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/unauthorized")({
  head: () => ({ meta: [{ title: "Unauthorized — Lan Pwint" }] }),
  component: Unauthorized,
});

function Unauthorized() {
  return (
    <PageShell>
      <section className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <ShieldAlert className="mx-auto h-12 w-12 text-[color:var(--gold)]" />
        <h1 className="mt-4 font-serif text-3xl text-navy sm:text-4xl">Access denied</h1>
        <p className="mt-3 text-muted-foreground">
          You don't have permission to view this page. Sign in with the correct account or
          return to your dashboard.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild variant="outline">
            <Link to="/dashboard">My dashboard</Link>
          </Button>
          <Button asChild className="bg-navy text-navy-foreground hover:bg-deep">
            <Link to="/auth" search={{ as: "student" }}>Sign in</Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
