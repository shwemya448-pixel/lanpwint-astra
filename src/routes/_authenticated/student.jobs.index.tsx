import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Briefcase, ExternalLink, MapPin, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatSalary, jobTypeLabel, timeAgo } from "@/lib/format";
import { MYWORLD_JOBS } from "@/lib/myworld-jobs";

export const Route = createFileRoute("/_authenticated/student/jobs/")({
  head: () => ({ meta: [{ title: "Browse jobs — Lan Pwint" }] }),
  component: JobsList,
});

type CardJob = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  job_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  skills: string[] | null;
  description: string | null;
  created_at: string;
  application_deadline?: string | null;
  external_url?: string;
  source?: string;
};

function JobsList() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("");
  const [source, setSource] = useState<"all" | "lanpwint" | "myworld">("all");

  const { data: dbJobs = [], isLoading } = useQuery({
    queryKey: ["jobs", "open"],
    queryFn: async () => {
      const { data } = await supabase
        .from("jobs")
        .select(
          "id, title, company, location, job_type, salary_min, salary_max, salary_currency, skills, description, requirements, application_deadline, created_at",
        )
        .eq("status", "open")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const lpCards: CardJob[] = dbJobs.map((j) => ({ ...j, source: "Lan Pwint" }));
  const mwCards: CardJob[] = MYWORLD_JOBS.map((j) => ({
    id: j.id,
    title: j.title,
    company: j.company,
    location: j.location,
    job_type: j.job_type,
    salary_min: j.salary_min,
    salary_max: j.salary_max,
    salary_currency: j.salary_currency,
    skills: j.skills,
    description: j.description,
    created_at: new Date(Date.now() - j.posted_days_ago * 86_400_000).toISOString(),
    application_deadline: null,
    external_url: j.source_url,
    source: j.source,
  }));

  const all =
    source === "lanpwint" ? lpCards :
    source === "myworld" ? mwCards :
    [...lpCards, ...mwCards];

  const filtered = all.filter((j) => {
    if (type && j.job_type !== type) return false;
    if (!q) return true;
    const hay = `${j.title} ${j.company ?? ""} ${j.location ?? ""} ${j.description ?? ""} ${(j.skills ?? []).join(" ")}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <PageShell>
      <PageHeader
        eyebrow="Opportunities"
        title="Open positions"
        description="Internships and graduate roles from Lan Pwint employers, plus curated openings from MyWorld Careers Myanmar."
      />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title, skill, company…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {[
              { v: "", l: "All" },
              { v: "internship", l: "Internship" },
              { v: "full_time", l: "Full time" },
              { v: "part_time", l: "Part time" },
              { v: "remote", l: "Remote" },
              { v: "contract", l: "Contract" },
            ].map((t) => (
              <button
                key={t.v}
                onClick={() => setType(t.v)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  type === t.v
                    ? "border-navy bg-navy text-navy-foreground"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {t.l}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {([
              { v: "all", l: `All sources (${lpCards.length + mwCards.length})` },
              { v: "lanpwint", l: `Lan Pwint (${lpCards.length})` },
              { v: "myworld", l: `MyWorld Careers (${mwCards.length})` },
            ] as const).map((t) => (
              <button
                key={t.v}
                onClick={() => setSource(t.v)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  source === t.v
                    ? "border-[color:var(--gold)] bg-[color:var(--gold-soft)] text-foreground"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {t.l}
              </button>
            ))}
          </div>
        </div>

        {isLoading && source !== "myworld" ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <Briefcase className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-serif text-xl text-navy">No jobs match your filters</p>
            <p className="mt-1 text-sm text-muted-foreground">Try different keywords or change the source filter.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lp-reveal-stagger">
            {filtered.map((j) => {
              const deadline = j.application_deadline ? new Date(j.application_deadline) : null;
              const deadlineSoon = deadline ? (deadline.getTime() - Date.now()) / 86400000 < 7 : false;
              const isExternal = !!j.external_url;
              const Wrapper: any = isExternal ? "a" : Link;
              const wrapperProps: any = isExternal
                ? { href: j.external_url, target: "_blank", rel: "noopener noreferrer" }
                : { to: "/student/jobs/$jobId", params: { jobId: j.id } };
              return (
                <Wrapper
                  key={j.id}
                  {...wrapperProps}
                  className="group flex flex-col rounded-2xl border bg-card p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-xl text-navy group-hover:text-[color:var(--gold)] transition-colors">
                        {j.title}
                      </h3>
                      {j.company && <p className="text-sm text-muted-foreground">{j.company}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge variant="secondary" className="bg-[color:var(--gold-soft)] text-[color:var(--gold)]">
                        {jobTypeLabel(j.job_type ?? "")}
                      </Badge>
                      {j.source && (
                        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                          {j.source}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {j.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {j.location}
                      </span>
                    )}
                    <span>{formatSalary(j.salary_min, j.salary_max, j.salary_currency ?? "MMK")}</span>
                    <span>Posted {timeAgo(j.created_at)}</span>
                    {deadline && (
                      <span className={deadlineSoon ? "text-destructive" : ""}>
                        Apply by {deadline.toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {j.description && (
                    <p className="mt-3 line-clamp-3 text-sm text-foreground/80">{j.description}</p>
                  )}

                  {j.skills && j.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {j.skills.slice(0, 6).map((s) => (
                        <span key={s} className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-foreground/80">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-auto pt-5">
                    <Button size="sm" className="lp-gold-btn">
                      {isExternal ? <>View on MyWorld <ExternalLink className="ml-1 h-3.5 w-3.5" /></> : "View & apply"}
                    </Button>
                  </div>
                </Wrapper>
              );
            })}
          </div>
        )}
      </section>
    </PageShell>
  );
}
