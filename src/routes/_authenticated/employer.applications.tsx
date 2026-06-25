import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { PageShell, PageHeader } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { timeAgo } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/employer/applications")({
  head: () => ({ meta: [{ title: "Applications — Lan Pwint" }] }),
  component: EmployerApps,
});

function EmployerApps() {
  const { user } = useSession();
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["employer-applications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: applications, error: applicationsError } = await supabase
        .from("applications")
        .select(`
          id, student_id, status, cover_letter, cv_url, employer_note, created_at,
          job:jobs!inner(id, title, employer_id)
        `)
        .eq("job.employer_id", user!.id)
        .order("created_at", { ascending: false });
      if (applicationsError) throw applicationsError;

      const studentIds = [...new Set((applications ?? []).map((app) => app.student_id).filter(Boolean))];
      const { data: profiles, error: profilesError } = studentIds.length
        ? await supabase
            .from("profiles")
            .select("id, full_name, headline, school, degree, skills, contact_email")
            .in("id", studentIds)
        : { data: [], error: null };
      if (profilesError) throw profilesError;

      const profilesById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
      return (applications ?? []).map((application) => ({
        ...application,
        profile: profilesById.get(application.student_id) ?? null,
      }));
    },
  });

  async function downloadCv(path: string) {
    const { data, error } = await supabase.storage.from("cvs").createSignedUrl(path, 60);
    if (error || !data) return toast.error("Could not load CV");
    window.open(data.signedUrl, "_blank");
  }

  async function updateApp(
    id: string,
    patch: { status?: "pending" | "reviewing" | "offered" | "accepted" | "rejected" | "withdrawn"; employer_note?: string | null },
    msg: string,
  ) {
    const { error } = await supabase.from("applications").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(msg);
    qc.invalidateQueries({ queryKey: ["employer-applications", user?.id] });
  }

  return (
    <PageShell>
      <PageHeader eyebrow="Recruit" title="Applications" description="Review applicants and send offers." />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {isLoading ? (
          <p>Loading…</p>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <p className="font-serif text-xl text-destructive">Applications could not load</p>
            <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="font-serif text-xl text-navy">No applications yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Post a job to start receiving applicants.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((a: any) => (
              <div key={a.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Applied to</p>
                    <p className="font-serif text-lg text-navy">{a.job?.title}</p>
                    <div className="mt-3">
                      <p className="font-medium">{a.profile?.full_name ?? "Anonymous"}</p>
                      <p className="text-sm text-muted-foreground">{a.profile?.headline}</p>
                      <p className="text-xs text-muted-foreground">
                        {[a.profile?.degree, a.profile?.school].filter(Boolean).join(" · ")}
                      </p>
                      {a.profile?.skills?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {a.profile.skills.slice(0, 6).map((s: string) => (
                            <span key={s} className="rounded-full bg-muted px-2.5 py-0.5 text-[11px]">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge>{a.status}</Badge>
                    <p className="mt-1 text-xs text-muted-foreground">{timeAgo(a.created_at)}</p>
                  </div>
                </div>

                {a.cover_letter && (
                  <div className="mt-4 rounded-md bg-muted/60 p-3 text-sm">
                    <p className="font-medium text-navy">Cover note</p>
                    <p className="mt-1 whitespace-pre-line">{a.cover_letter}</p>
                  </div>
                )}
                {a.employer_note && (
                  <div className="mt-3 rounded-md border border-teal/30 bg-teal/5 p-3 text-sm">
                    <p className="font-medium text-teal">Your offer note</p>
                    <p className="mt-1 whitespace-pre-line">{a.employer_note}</p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {a.cv_url && (
                    <Button variant="outline" size="sm" onClick={() => downloadCv(a.cv_url)}>
                      <FileText className="mr-1 h-4 w-4" /> View CV
                      <Download className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  )}
                  {!a.cv_url && (
                    <span className="inline-flex items-center rounded-md border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground">
                      No CV file attached
                    </span>
                  )}
                  {a.status === "pending" && (
                    <Button size="sm" variant="outline" onClick={() => updateApp(a.id, { status: "reviewing" }, "Marked as reviewing")}>
                      Mark reviewing
                    </Button>
                  )}
                  {a.status !== "offered" && a.status !== "accepted" && (
                    <OfferDialog onSend={(note) => updateApp(a.id, { status: "offered", employer_note: note }, "Offer sent — student notified")} />
                  )}
                  {a.status !== "rejected" && a.status !== "accepted" && (
                    <Button size="sm" variant="ghost" onClick={() => updateApp(a.id, { status: "rejected" }, "Application rejected")}>
                      Reject
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}

function OfferDialog({ onSend }: { onSend: (note: string) => void }) {
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-teal text-white hover:bg-teal/90">Send offer</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send a job offer</DialogTitle>
          <DialogDescription>
            The student will receive a notification asking them to confirm or decline.
          </DialogDescription>
        </DialogHeader>
        <Textarea rows={5} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Offer details — start date, compensation, next steps…" maxLength={2000} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="bg-navy text-navy-foreground hover:bg-deep" onClick={() => { onSend(note); setOpen(false); setNote(""); }}>
            Send offer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
