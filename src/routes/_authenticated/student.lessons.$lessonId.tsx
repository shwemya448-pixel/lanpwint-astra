import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/student/lessons/$lessonId")({
  head: () => ({ meta: [{ title: "Lesson — Lan Pwint" }] }),
  component: LessonDetail,
});

function isYouTube(url: string) {
  return /youtu\.be|youtube\.com/.test(url);
}
function ytEmbed(url: string) {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}

function LessonDetail() {
  const { lessonId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      const { data } = await supabase.from("lessons").select("*").eq("id", lessonId).maybeSingle();
      return data;
    },
  });

  if (isLoading) return <PageShell><div className="mx-auto max-w-4xl p-10">Loading…</div></PageShell>;
  if (!data) return <PageShell><div className="mx-auto max-w-4xl p-10">Lesson not found.</div></PageShell>;

  return (
    <PageShell>
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/student/lessons" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All lessons
        </Link>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-black">
          <div className="relative aspect-video">
            {isYouTube(data.video_url) ? (
              <iframe
                src={ytEmbed(data.video_url)}
                className="absolute inset-0 h-full w-full"
                title={data.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video src={data.video_url} controls className="h-full w-full" />
            )}
          </div>
        </div>

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {data.category && <Badge variant="secondary" className="bg-teal/15 text-teal">{data.category}</Badge>}
            {data.level && <span className="capitalize">{data.level}</span>}
            {data.duration_minutes && <span>· {data.duration_minutes} min</span>}
          </div>
          <h1 className="mt-2 font-serif text-3xl text-navy">{data.title}</h1>
          {data.description && <p className="mt-3 whitespace-pre-line text-foreground/85">{data.description}</p>}
        </header>
      </section>
    </PageShell>
  );
}
