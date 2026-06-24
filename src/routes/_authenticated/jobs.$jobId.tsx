import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { ArrowLeft, MapPin, Calendar, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useUserRoles } from "@/lib/auth";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatSalary, jobTypeLabel, timeAgo } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/jobs/$jobId")({
  head: () => ({ meta: [{ title: "Job — Lan Pwint" }] }),
  component: JobDetail,
});

function JobDetail() {
  const { jobId } = Route.useParams();
  const { user } = useSession();
  const roles = useUserRoles(user);
  const isStudent = roles.includes("student");
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const { data } = await supabase.from("jobs").select("*").eq("id", jobId).maybeSingle();
      return data;
    },
  });

  const { data: existing } = useQuery({
    queryKey: ["my-app", jobId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("applications")
        .select("id, status, created_at")
        .eq("job_id", jobId)
        .eq("student_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function submit() {
    if (!user) return;
    if (!cvFile) {
      toast.error("Please upload your CV (PDF or DOCX).");
      return;
    }
    setSubmitting(true);
    try {
      const ext = cvFile.name.split(".").pop() ?? "pdf";
      const path = `${user.id}/${jobId}-${Date.now()}.${ext}`;
      const up = await supabase.storage.from("cvs").upload(path, cvFile, { upsert: true });
      if (up.error) throw up.error;

      const ins = await supabase.from("applications").insert({
        job_id: jobId,
        student_id: user.id,
        cv_url: path,
        cover_letter: coverLetter || null,
      });
      if (ins.error) throw ins.error;

      toast.success("Application submitted!");
      qc.invalidateQueries({ queryKey: ["my-app", jobId, user.id] });
      navigate({ to: "/applications" });
    } catch (e: any) {
      toast.error(e.message ?? "Could not submit application");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-4xl px-4 py-12">Loading…</div>
      </PageShell>
    );
  }
  if (!job) {
    return (
      <PageShell>
        <div className="mx-auto max-w-4xl px-4 py-12">
          <p>Job not found.</p>
          <Link to="/jobs" className="text-teal hover:underline">← Back to jobs</Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All jobs
        </Link>

        <header className="mt-6 rounded-2xl border border-border bg-card p-8">
          <Badge variant="secondary" className="bg-teal/15 text-teal">{jobTypeLabel(job.job_type)}</Badge>
          <h1 className="mt-3 font-serif text-3xl text-navy sm:text-4xl">{job.title}</h1>
          {job.company && <p className="mt-1 text-lg text-muted-foreground">{job.company}</p>}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            {job.location && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>}
            <span>{formatSalary(job.salary_min, job.salary_max, job.salary_currency ?? "MMK")}</span>
            {job.application_deadline && (
              <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" />Apply by {new Date(job.application_deadline).toLocaleDateString()}</span>
            )}
            <span>Posted {timeAgo(job.created_at)}</span>
          </div>
        </header>

        <div className="mt-8 grid gap-8">
          <div>
            <h2 className="font-serif text-xl text-navy">About the role</h2>
            <p className="mt-3 whitespace-pre-line text-foreground/85">{job.description}</p>
          </div>
          {job.requirements && (
            <div>
              <h2 className="font-serif text-xl text-navy">Requirements</h2>
              <p className="mt-3 whitespace-pre-line text-foreground/85">{job.requirements}</p>
            </div>
          )}
          {job.skills && job.skills.length > 0 && (
            <div>
              <h2 className="font-serif text-xl text-navy">Skills</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.skills.map((s: string) => (
                  <span key={s} className="rounded-full bg-muted px-3 py-1 text-xs">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card p-6">
          {!isStudent ? (
            <p className="text-sm text-muted-foreground">Only students can apply to job postings.</p>
          ) : existing ? (
            <div>
              <p className="font-serif text-lg text-navy">You've applied to this role</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Status: <Badge variant="secondary">{existing.status}</Badge> · {timeAgo(existing.created_at)}
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/applications">View my applications</Link>
              </Button>
            </div>
          ) : (
            <div>
              <h2 className="font-serif text-xl text-navy">Apply now</h2>
              <p className="mt-1 text-sm text-muted-foreground">Upload your CV and a short message to the employer.</p>
              <div className="mt-5 space-y-4">
                <div>
                  <Label>CV (PDF or DOCX)</Label>
                  <div className="mt-1.5 flex items-center gap-3">
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      hidden
                      onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
                    />
                    <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
                      <Upload className="mr-2 h-4 w-4" /> Choose file
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {cvFile ? cvFile.name : "No file selected"}
                    </span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="cover">Cover note (optional)</Label>
                  <Textarea
                    id="cover"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={5}
                    placeholder="Tell the employer why you're a good fit…"
                    maxLength={2000}
                  />
                </div>
                <Button
                  onClick={submit}
                  disabled={submitting}
                  className="bg-navy text-navy-foreground hover:bg-deep"
                >
                  {submitting ? "Submitting…" : "Submit application"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
