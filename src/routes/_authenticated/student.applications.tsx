import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { PageShell, PageHeader } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/student/applications")({
  head: () => ({ meta: [{ title: "My applications — Lan Pwint" }] }),
  component: MyApplications,
});

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-muted text-foreground",
  reviewing: "bg-blue-100 text-blue-800",
  offered: "bg-teal/20 text-teal",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  withdrawn: "bg-muted text-muted-foreground",
};

function MyApplications() {
  const { user } = useSession();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["my-applications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("applications")
        .select("id, status, created_at, employer_note, job:jobs(id, title, company, location)")
        .eq("student_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function respond(appId: string, status: "accepted" | "rejected") {
    const { error } = await supabase.from("applications").update({ status }).eq("id", appId);
    if (error) toast.error(error.message);
    else {
      toast.success(status === "accepted" ? "Offer accepted!" : "Offer declined");
      qc.invalidateQueries({ queryKey: ["my-applications", user?.id] });
    }
  }

  return (
    <PageShell>
      <PageHeader eyebrow="Career" title="My applications" description="Track every role you've applied to and respond to offers." />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {isLoading ? (
          <p>Loading…</p>
        ) : !data || data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="font-serif text-xl text-navy">No applications yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Browse the latest openings and apply.</p>
            <Button asChild className="mt-5 bg-navy text-navy-foreground hover:bg-deep">
              <Link to="/student/jobs">Browse jobs</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((a: any) => (
              <div key={a.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link to="/student/jobs/$jobId" params={{ jobId: a.job?.id }} className="font-serif text-lg text-navy hover:text-teal">
                      {a.job?.title ?? "Job"}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {a.job?.company ?? ""}{a.job?.location ? ` · ${a.job.location}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={STATUS_STYLES[a.status] ?? ""}>{a.status}</Badge>
                    <p className="mt-1 text-xs text-muted-foreground">Applied {timeAgo(a.created_at)}</p>
                  </div>
                </div>
                {a.employer_note && (
                  <p className="mt-3 rounded-md bg-muted/60 p-3 text-sm">
                    <span className="font-medium text-navy">Employer note:</span> {a.employer_note}
                  </p>
                )}
                {a.status === "offered" && (
                  <div className="mt-4 flex gap-2">
                    <Button onClick={() => respond(a.id, "accepted")} className="bg-teal text-white hover:bg-teal/90">
                      Confirm & accept offer
                    </Button>
                    <Button variant="outline" onClick={() => respond(a.id, "rejected")}>
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
