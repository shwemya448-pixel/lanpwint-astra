import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, GraduationCap, MapPin, MessageSquare, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/employer/cv-board")({
  head: () => ({ meta: [{ title: "CV Board — Lan Pwint" }] }),
  component: CVBoardPage,
});

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  bio: string | null;
  school: string | null;
  degree: string | null;
  graduation_year: number | null;
  location: string | null;
  skills: string[] | null;
  contact_email: string | null;
  cv_url: string | null;
};

function initials(name?: string | null) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
}

function CVBoardPage() {
  const [q, setQ] = useState("");

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["cv-board"],
    queryFn: async () => {
      // Only show profiles with at least some real data (no totally-empty rows).
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, headline, bio, school, degree, graduation_year, location, skills, contact_email, cv_url")
        .order("updated_at", { ascending: false })
        .limit(60);
      if (error) throw error;
      return (data ?? []).filter((p: Profile) =>
        (p.full_name && p.full_name.trim()) || p.headline || p.school || (p.skills && p.skills.length),
      ) as Profile[];
    },
  });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return profiles;
    return profiles.filter((p) =>
      [p.full_name, p.headline, p.school, p.location, p.degree, ...(p.skills ?? [])]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(s)),
    );
  }, [profiles, q]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lp-reveal">
      <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--gold)]">CV Board</p>
      <h1 className="mt-2 font-serif text-3xl text-foreground sm:text-4xl">Student CVs, refreshed daily</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Search verified profiles by name, skill, school or city. Tap Message to start a realtime chat.
      </p>
      <div className="mt-4 lp-divider-gold w-32" />

      <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-card p-2">
        <Search className="ml-2 h-4 w-4 text-[color:var(--gold)]" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search skill, school, city…"
          className="border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
        <span className="pr-3 text-xs text-muted-foreground">{filtered.length} candidate{filtered.length === 1 ? "" : "s"}</span>
      </div>

      {isLoading ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading candidates…</p>
      ) : filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          No matching profiles yet. Try a different search, or wait for students to update their CVs.
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lp-reveal-stagger">
          {filtered.map((p) => (
            <article key={p.id} className="lp-card group p-5 transition-all hover:-translate-y-1 hover:shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[color:var(--gold)]/15 text-[color:var(--gold)] font-serif">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    initials(p.full_name)
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-serif text-lg text-foreground">
                    {p.full_name?.trim() || "Anonymous candidate"}
                  </h3>
                  {p.headline && <p className="truncate text-xs text-muted-foreground">{p.headline}</p>}
                </div>
              </div>

              <div className="mt-3 lp-divider-gold" />

              <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                {p.school && (
                  <li className="inline-flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-[color:var(--gold)]" />
                    <span className="truncate">{p.school}{p.graduation_year ? ` · ${p.graduation_year}` : ""}</span>
                  </li>
                )}
                {p.location && (
                  <li className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[color:var(--gold)]" /> {p.location}
                  </li>
                )}
                {p.degree && (
                  <li className="inline-flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-[color:var(--gold)]" /> {p.degree}
                  </li>
                )}
              </ul>

              {p.skills && p.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.skills.slice(0, 6).map((s) => (
                    <Badge key={s} variant="secondary" className="bg-[color:var(--gold)]/15 text-[color:var(--gold)] hover:bg-[color:var(--gold)]/25">
                      {s}
                    </Badge>
                  ))}
                </div>
              )}

              {p.bio && <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{p.bio}</p>}

              <Button asChild className="mt-4 w-full bg-[color:var(--navy)] text-[color:var(--navy-foreground)] hover:bg-[color:var(--deep)]">
                <Link to="/employer/messages" search={{ to: p.contact_email ?? "" } as never}>
                  <MessageSquare className="mr-2 h-4 w-4" /> Message
                </Link>
              </Button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
