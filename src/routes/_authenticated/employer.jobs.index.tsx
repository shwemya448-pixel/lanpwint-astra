import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { PageShell, PageHeader } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { jobTypeLabel, timeAgo } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/employer/jobs/")({
  head: () => ({ meta: [{ title: "My job posts — Lan Pwint" }] }),
  component: EmployerJobs,
});

function EmployerJobs() {
  const { user } = useSession();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["employer-jobs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("jobs")
        .select("id, title, location, job_type, status, created_at")
        .eq("employer_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function setStatus(id: string, status: "open" | "closed") {
    const { error } = await supabase.from("jobs").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(status === "open" ? "Reopened" : "Closed");
    qc.invalidateQueries({ queryKey: ["employer-jobs", user?.id] });
  }
  async function remove(id: string) {
    if (!confirm("Delete this job post?")) return;
    const { error } = await supabase.from("jobs").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["employer-jobs", user?.id] });
  }

  return (
    <PageShell>
      <PageHeader eyebrow="Recruit" title="My job posts" description="Manage your published roles and review applicants." />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Button asChild className="bg-navy text-navy-foreground hover:bg-deep">
            <Link to="/employer/jobs/new"><Plus className="mr-1 h-4 w-4" /> Post a new job</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/employer/applications">View applications</Link>
          </Button>
        </div>

        {isLoading ? (
          <p>Loading…</p>
        ) : !data || data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="font-serif text-xl text-navy">No jobs yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Post your first role to start receiving applications.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((j) => (
              <div key={j.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
                <div>
                  <Link to="/jobs/$jobId" params={{ jobId: j.id }} className="font-serif text-lg text-navy hover:text-teal">
                    {j.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="bg-teal/15 text-teal">{jobTypeLabel(j.job_type)}</Badge>
                    {j.location && <span>{j.location}</span>}
                    <span>· {timeAgo(j.created_at)}</span>
                    <Badge variant={j.status === "open" ? "default" : "secondary"}>{j.status}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setStatus(j.id, j.status === "open" ? "closed" : "open")}>
                    {j.status === "open" ? "Close" : "Reopen"}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(j.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
