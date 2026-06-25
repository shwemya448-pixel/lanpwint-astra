import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/student/lessons/")({
  head: () => ({ meta: [{ title: "Learning Center — Lan Pwint" }] }),
  component: LessonsList,
});

function LessonsList() {
  const { data, isLoading } = useQuery({
    queryKey: ["lessons"],
    queryFn: async () => {
      const { data } = await supabase
        .from("lessons")
        .select("id, title, description, thumbnail_url, category, level, duration_minutes")
        .eq("published", true)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <PageShell>
      <PageHeader
        eyebrow="Learning Center"
        title="Lessons from real internship experiences"
        description="Video lessons curated by Lan Pwint admins — watch, learn, and grow."
      />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {isLoading ? (
          <p>Loading…</p>
        ) : !data || data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <PlayCircle className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-serif text-xl text-navy">No lessons yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Check back soon for new content.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((l) => (
              <Link
                key={l.id}
                to="/lessons/$lessonId"
                params={{ lessonId: l.id }}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-teal"
              >
                <div className="relative aspect-video bg-muted">
                  {l.thumbnail_url ? (
                    <img src={l.thumbnail_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-navy to-deep text-navy-foreground">
                      <PlayCircle className="h-12 w-12 opacity-80" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {l.category && <Badge variant="secondary" className="bg-teal/15 text-teal">{l.category}</Badge>}
                    {l.level && <span className="capitalize">{l.level}</span>}
                    {l.duration_minutes && <span>· {l.duration_minutes} min</span>}
                  </div>
                  <h3 className="mt-2 font-serif text-lg text-navy group-hover:text-teal">{l.title}</h3>
                  {l.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{l.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
