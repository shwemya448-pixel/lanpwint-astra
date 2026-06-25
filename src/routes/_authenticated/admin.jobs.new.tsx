import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/jobs/new")({
  head: () => ({ meta: [{ title: "Admin · Post a job — Lan Pwint" }] }),
  component: AdminNewJob,
});

const schema = z.object({
  title: z.string().trim().min(3).max(120),
  company: z.string().trim().max(120).optional(),
  description: z.string().trim().min(20).max(5000),
  requirements: z.string().trim().max(3000).optional(),
  location: z.string().trim().max(120).optional(),
  job_type: z.enum(["full_time", "part_time", "internship", "contract", "remote"]),
});

function AdminNewJob() {
  const { user } = useSession();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [f, setF] = useState({
    title: "", company: "Lan Pwint", description: "", requirements: "",
    location: "", job_type: "full_time" as const,
    salary_min: "", salary_max: "", salary_currency: "MMK",
    skills: "", application_deadline: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse(f);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("jobs").insert({
      employer_id: user.id,
      title: f.title.trim(),
      company: f.company.trim() || "Lan Pwint",
      description: f.description.trim(),
      requirements: f.requirements.trim() || null,
      location: f.location.trim() || null,
      job_type: f.job_type,
      salary_min: f.salary_min ? Number(f.salary_min) : null,
      salary_max: f.salary_max ? Number(f.salary_max) : null,
      salary_currency: f.salary_currency || "MMK",
      skills: f.skills.split(",").map((s) => s.trim()).filter(Boolean),
      application_deadline: f.application_deadline || null,
      status: "open",
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Job posted!");
    navigate({ to: "/admin/jobs" });
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl text-navy">Post a job</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Posting as <strong>Lan Pwint</strong>. This job appears alongside employer postings.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-6 rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Job title *"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={120} required /></Field>
          <Field label="Company / brand"><Input value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} maxLength={120} /></Field>
          <Field label="Location"><Input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} placeholder="Yangon, Remote…" /></Field>
          <Field label="Job type *">
            <Select value={f.job_type} onValueChange={(v: any) => setF({ ...f, job_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="full_time">Full time</SelectItem>
                <SelectItem value="part_time">Part time</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Salary min"><Input type="number" value={f.salary_min} onChange={(e) => setF({ ...f, salary_min: e.target.value })} /></Field>
          <Field label="Salary max"><Input type="number" value={f.salary_max} onChange={(e) => setF({ ...f, salary_max: e.target.value })} /></Field>
          <Field label="Currency"><Input value={f.salary_currency} onChange={(e) => setF({ ...f, salary_currency: e.target.value })} maxLength={8} /></Field>
          <Field label="Application deadline"><Input type="date" value={f.application_deadline} onChange={(e) => setF({ ...f, application_deadline: e.target.value })} /></Field>
        </div>
        <Field label="Skills (comma-separated)">
          <Input value={f.skills} onChange={(e) => setF({ ...f, skills: e.target.value })} placeholder="React, TypeScript, Communication" />
        </Field>
        <Field label="Description *">
          <Textarea rows={8} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} maxLength={5000} required />
        </Field>
        <Field label="Requirements">
          <Textarea rows={5} value={f.requirements} onChange={(e) => setF({ ...f, requirements: e.target.value })} maxLength={3000} />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" disabled={submitting} className="bg-navy text-navy-foreground hover:bg-deep">
            {submitting ? "Posting…" : "Publish job"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
