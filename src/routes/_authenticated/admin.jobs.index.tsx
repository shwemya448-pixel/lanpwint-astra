import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Plus, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/jobs/")({
  head: () => ({ meta: [{ title: "Admin · Jobs — Lan Pwint" }] }),
  component: AdminJobs,
});

function AdminJobs() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, company, location, job_type, status, created_at, employer_id")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function remove(id: string) {
    if (!confirm("Delete this job?")) return;
    const { error } = await supabase.from("jobs").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Job deleted");
    qc.invalidateQueries({ queryKey: ["admin-jobs"] });
  }

  async function toggleStatus(id: string, current: string) {
    const next = current === "open" ? "closed" : "open";
    const { error } = await supabase.from("jobs").update({ status: next }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Job ${next}`);
    qc.invalidateQueries({ queryKey: ["admin-jobs"] });
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-navy">All jobs</h1>
          <p className="mt-1 text-sm text-muted-foreground">Every job on the platform — admin or employer-posted.</p>
        </div>
        <Button asChild className="bg-navy text-navy-foreground hover:bg-deep">
          <Link to="/admin/jobs/new"><Plus className="mr-1.5 h-4 w-4" /> Post a job</Link>
        </Button>
      </div>

      {error ? (
        <p className="mt-6 text-sm text-destructive">{(error as Error).message}</p>
      ) : isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
      ) : !data || data.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Briefcase className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 font-serif text-xl text-navy">No jobs yet</p>
          <p className="text-sm text-muted-foreground">Post the first one above.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((j) => (
                <tr key={j.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-navy">{j.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{j.company ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{j.job_type?.replace("_", " ")}</td>
                  <td className="px-4 py-3">
                    <Badge variant={j.status === "open" ? "default" : "secondary"}>{j.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => toggleStatus(j.id, j.status)}>
                        {j.status === "open" ? "Close" : "Reopen"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(j.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
