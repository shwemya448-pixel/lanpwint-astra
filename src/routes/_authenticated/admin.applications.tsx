import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/applications")({
  head: () => ({ meta: [{ title: "Admin · Applications — Lan Pwint" }] }),
  component: AdminApps,
});

type Status = "pending" | "reviewing" | "offered" | "accepted" | "rejected" | "withdrawn";

function AdminApps() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const { data: apps, error: e1 } = await supabase
        .from("applications")
        .select(
          "id, student_id, status, cover_letter, cv_url, employer_note, created_at, job:jobs!inner(id, title, company, employer_id)",
        )
        .order("created_at", { ascending: false });
      if (e1) throw e1;

      const ids = [...new Set((apps ?? []).map((a) => a.student_id))];
      const { data: profiles } = ids.length
        ? await supabase
            .from("profiles")
            .select("id, full_name, headline, school, contact_email")
            .in("id", ids)
        : { data: [] as any[] };
      const map = new Map((profiles ?? []).map((p) => [p.id, p]));
      return (apps ?? []).map((a) => ({ ...a, profile: map.get(a.student_id) ?? null }));
    },
  });

  async function setStatus(id: string, status: Status) {
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Application ${status}`);
    qc.invalidateQueries({ queryKey: ["admin-applications"] });
  }

  async function downloadCv(path: string) {
    const { data, error } = await supabase.storage.from("cvs").createSignedUrl(path, 60);
    if (error || !data) return toast.error("Could not load CV");
    window.open(data.signedUrl, "_blank");
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl text-navy">Applications</h1>
      <p className="mt-1 text-sm text-muted-foreground">Every application across the platform. Accept candidates to send an offer.</p>

      {error ? (
        <p className="mt-6 text-sm text-destructive">{(error as Error).message}</p>
      ) : isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
      ) : !data || data.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 font-serif text-xl text-navy">No applications yet</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {data.map((a) => (
            <li key={a.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-serif text-lg text-navy">
                      {a.profile?.full_name ?? "Unnamed candidate"}
                    </p>
                    <Badge variant="outline" className="capitalize">{a.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Applied {timeAgo(a.created_at)} · {a.profile?.contact_email ?? "no email"}
                  </p>
                  <p className="mt-1 text-sm">
                    Job: <span className="font-medium text-navy">{a.job?.title}</span>
                    {a.job?.company ? <span className="text-muted-foreground"> · {a.job.company}</span> : null}
                  </p>
                  {a.profile?.headline && (
                    <p className="mt-1 text-sm text-muted-foreground">{a.profile.headline}</p>
                  )}
                  {a.cover_letter && (
                    <details className="mt-2 text-sm">
                      <summary className="cursor-pointer text-[color:var(--gold)]">Cover letter</summary>
                      <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{a.cover_letter}</p>
                    </details>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {a.cv_url && (
                    <Button size="sm" variant="outline" onClick={() => downloadCv(a.cv_url!)}>
                      <Download className="mr-1.5 h-4 w-4" /> View CV
                    </Button>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => setStatus(a.id, "reviewing")}>Reviewing</Button>
                    <Button size="sm" className="bg-[color:var(--gold)] text-[color:var(--navy)] hover:brightness-110" onClick={() => setStatus(a.id, "offered")}>Send offer</Button>
                    <Button size="sm" className="bg-navy text-navy-foreground hover:bg-deep" onClick={() => setStatus(a.id, "accepted")}>Accept</Button>
                    <Button size="sm" variant="destructive" onClick={() => setStatus(a.id, "rejected")}>Reject</Button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
