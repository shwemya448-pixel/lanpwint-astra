import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Briefcase, MapPin, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatSalary, jobTypeLabel, timeAgo } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/student/jobs/")({
  head: () => ({ meta: [{ title: "Browse jobs — Lan Pwint" }] }),
  component: JobsList,
});

function JobsList() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["jobs", "open"],
    queryFn: async () => {
      const { data } = await supabase
        .from("jobs")
        .select("id, title, company, location, job_type, salary_min, salary_max, salary_currency, skills, created_at")
        .eq("status", "open")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const filtered = (data ?? []).filter((j) => {
    if (type && j.job_type !== type) return false;
    if (!q) return true;
    const hay = `${j.title} ${j.company ?? ""} ${j.location ?? ""} ${(j.skills ?? []).join(" ")}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <PageShell>
      <PageHeader
        eyebrow="Opportunities"
        title="Open positions"
        description="Internships and graduate roles from employers on Lan Pwint."
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
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <Briefcase className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-serif text-xl text-navy">No jobs match your filters</p>
            <p className="mt-1 text-sm text-muted-foreground">Check back soon — new roles are posted every week.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((j) => (
              <Link
                key={j.id}
                to="/student/jobs/$jobId"
                params={{ jobId: j.id }}
                className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-teal"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-xl text-navy">{j.title}</h3>
                    {j.company && <p className="text-sm text-muted-foreground">{j.company}</p>}
                  </div>
                  <Badge variant="secondary" className="bg-teal/15 text-teal">{jobTypeLabel(j.job_type)}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {j.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {j.location}
                    </span>
                  )}
                  <span>{formatSalary(j.salary_min, j.salary_max, j.salary_currency ?? "MMK")}</span>
                  <span>{timeAgo(j.created_at)}</span>
                </div>
                {j.skills && j.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {j.skills.slice(0, 5).map((s) => (
                      <span key={s} className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-foreground/80">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-5">
                  <Button size="sm" className="bg-navy text-navy-foreground hover:bg-deep">
                    View & apply
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
