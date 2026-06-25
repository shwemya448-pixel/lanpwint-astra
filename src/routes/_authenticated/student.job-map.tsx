import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Briefcase, ExternalLink } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatSalary, jobTypeLabel, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MYWORLD_JOBS } from "@/lib/myworld-jobs";

export const Route = createFileRoute("/_authenticated/student/job-map")({
  head: () => ({ meta: [{ title: "Job Map — Lan Pwint" }] }),
  component: JobMapPage,
});

type CityKey = "yangon" | "mandalay" | "naypyitaw" | "bago" | "taunggyi" | "mawlamyine" | "remote" | "other";

const CITIES: Record<CityKey, { label: string; lat: number; lng: number; bbox: [number, number, number, number] }> = {
  yangon:     { label: "Yangon",      lat: 16.8409, lng: 96.1735, bbox: [96.00, 16.70, 96.35, 17.00] },
  mandalay:   { label: "Mandalay",    lat: 21.9588, lng: 96.0891, bbox: [95.95, 21.85, 96.25, 22.05] },
  naypyitaw:  { label: "Nay Pyi Taw", lat: 19.7633, lng: 96.0785, bbox: [95.90, 19.65, 96.25, 19.90] },
  bago:       { label: "Bago",        lat: 17.3360, lng: 96.4815, bbox: [96.30, 17.20, 96.60, 17.45] },
  taunggyi:   { label: "Taunggyi",    lat: 20.7833, lng: 97.0333, bbox: [96.85, 20.65, 97.20, 20.90] },
  mawlamyine: { label: "Mawlamyine",  lat: 16.4906, lng: 97.6285, bbox: [97.45, 16.35, 97.80, 16.60] },
  remote:     { label: "Remote",      lat: 19.7450, lng: 96.1150, bbox: [92.0, 9.5, 101.5, 28.5] },
  other:      { label: "All Myanmar", lat: 19.7450, lng: 96.1150, bbox: [92.0, 9.5, 101.5, 28.5] },
};

function classifyCity(loc?: string | null): CityKey {
  const s = (loc ?? "").toLowerCase();
  if (!s) return "other";
  if (s.includes("remote")) return "remote";
  if (s.includes("yangon") || s.includes("rangoon")) return "yangon";
  if (s.includes("mandalay")) return "mandalay";
  if (s.includes("naypyi") || s.includes("nay pyi")) return "naypyitaw";
  if (s.includes("bago") || s.includes("pegu")) return "bago";
  if (s.includes("taunggyi")) return "taunggyi";
  if (s.includes("mawlamy") || s.includes("moulmein")) return "mawlamyine";
  return "other";
}

function JobMapPage() {
  const [active, setActive] = useState<CityKey>("yangon");

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs", "open", "map"],
    queryFn: async () => {
      const { data } = await supabase
        .from("jobs")
        .select("id, title, company, location, job_type, salary_min, salary_max, salary_currency, created_at")
        .eq("status", "open")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const grouped = useMemo(() => {
    const map: Record<CityKey, any[]> = {
      yangon: [], mandalay: [], naypyitaw: [], bago: [], taunggyi: [], mawlamyine: [], remote: [], other: [],
    };
    for (const j of jobs) map[classifyCity(j.location)].push({ ...j, source: "Lan Pwint" });
    for (const m of MYWORLD_JOBS) {
      map[classifyCity(m.location)].push({
        id: m.id, title: m.title, company: m.company, location: m.location,
        job_type: m.job_type, salary_min: m.salary_min, salary_max: m.salary_max,
        salary_currency: m.salary_currency,
        created_at: new Date(Date.now() - m.posted_days_ago * 86_400_000).toISOString(),
        external_url: m.source_url, source: m.source,
      });
    }
    return map;
  }, [jobs]);

  const city = CITIES[active];
  const [w, s, e, n] = city.bbox;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${w}%2C${s}%2C${e}%2C${n}&layer=mapnik&marker=${city.lat}%2C${city.lng}`;

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lp-reveal">
        <p className="text-xs uppercase tracking-[0.22em] page-gold">Job Map</p>
        <h1 className="mt-2 font-serif text-3xl text-navy sm:text-4xl">Open roles across Myanmar</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Pick a city to focus the map and see jobs based there. Data updates live from new postings.
        </p>

        <div className="mt-6 flex flex-wrap gap-2 lp-reveal-stagger">
          {(Object.keys(CITIES) as CityKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setActive(k)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm",
                active === k
                  ? "bg-navy text-navy-foreground border-navy"
                  : "bg-card text-foreground/80 hover:text-foreground",
              )}
            >
              {CITIES[k].label}
              <span className="ml-2 text-[10px] opacity-70">{grouped[k].length}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="overflow-hidden rounded-2xl border bg-card">
            <iframe
              key={active}
              title={`Map of ${city.label}`}
              src={mapUrl}
              className="h-[460px] w-full lp-reveal"
              loading="lazy"
            />
            <div className="flex items-center justify-between gap-3 border-t px-4 py-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[color:var(--gold)]" />
                {city.label} · {city.lat.toFixed(3)}, {city.lng.toFixed(3)}
              </span>
              <a
                className="lp-link-gold inline-flex items-center gap-1"
                target="_blank"
                rel="noreferrer"
                href={`https://www.openstreetmap.org/?mlat=${city.lat}&mlon=${city.lng}#map=12/${city.lat}/${city.lng}`}
              >
                Open in OpenStreetMap <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-4">
            <h2 className="font-serif text-xl text-navy">
              Jobs in {city.label}
              <span className="ml-2 text-sm text-muted-foreground">({grouped[active].length})</span>
            </h2>
            {isLoading ? (
              <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
            ) : grouped[active].length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No open postings in {city.label} yet. Try another city.
              </p>
            ) : (
              <ul className="mt-4 max-h-[400px] space-y-3 overflow-y-auto pr-1 lp-reveal-stagger">
                {grouped[active].map((j: any) => {
                  const isExt = !!j.external_url;
                  const Wrap: any = isExt ? "a" : Link;
                  const props: any = isExt
                    ? { href: j.external_url, target: "_blank", rel: "noopener noreferrer" }
                    : { to: "/student/jobs/$jobId", params: { jobId: j.id } };
                  return (
                    <li key={j.id}>
                      <Wrap {...props} className="block rounded-xl border bg-background/40 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-serif text-base text-navy">{j.title}</p>
                            {j.company && <p className="text-xs text-muted-foreground">{j.company}</p>}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="secondary" className="bg-[color:var(--gold-soft)] text-[color:var(--gold)]">
                              {jobTypeLabel(j.job_type ?? "")}
                            </Badge>
                            {j.source && (
                              <span className="rounded-full border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                                {j.source}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                          {j.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{j.location}</span>}
                          <span>{formatSalary(j.salary_min, j.salary_max, j.salary_currency ?? "MMK")}</span>
                          <span>{timeAgo(j.created_at)}</span>
                          {isExt && <span className="inline-flex items-center gap-0.5 text-[color:var(--gold)]">MyWorld <ExternalLink className="h-2.5 w-2.5" /></span>}
                        </div>
                      </Wrap>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-4 border-t pt-3">
              <Link to="/student/jobs" className="inline-flex items-center gap-1 text-sm lp-link-gold">
                <Briefcase className="h-4 w-4" /> Browse all jobs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
