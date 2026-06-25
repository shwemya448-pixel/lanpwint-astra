import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useLocale } from "@/lib/i18n";

export const Route = createFileRoute("/news/$slug")({
  component: NewsDetail,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        <h1 className="font-serif text-3xl">Not found</h1>
        <Link to="/news" className="text-[color:var(--gold)] underline">Back to news</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center px-4 text-center">
      <p className="text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function NewsDetail() {
  const { slug } = Route.useParams();
  const { t, lang } = useLocale();

  const { data: post, isLoading } = useQuery({
    queryKey: ["news_post", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("news_posts")
        .select("*, news_categories(slug,name_en,name_my)")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (!data) throw notFound();
      return data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col inner-page">
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <Link to="/news" className="inline-flex items-center gap-1.5 text-sm text-[color:var(--gold)] hover:underline">
          <ArrowLeft className="h-4 w-4" /> {t("news.back")}
        </Link>
        {isLoading || !post ? (
          <p className="mt-8 text-muted-foreground">{t("common.loading")}</p>
        ) : (
          <article className="mt-6">
            {post.news_categories && (
              <div className="text-xs uppercase tracking-wider text-[color:var(--gold)]">
                {lang === "my" ? post.news_categories.name_my : post.news_categories.name_en}
              </div>
            )}
            <h1 className="mt-2 font-serif text-4xl md:text-5xl page-gold">
              {lang === "my" ? post.title_my : post.title_en}
            </h1>
            <div className="mt-2 text-sm text-muted-foreground">
              {new Date(post.published_at).toLocaleDateString(lang === "my" ? "my-MM" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>
            {post.image_url && (
              <img src={post.image_url} alt="" className="mt-6 w-full rounded-xl border border-border" />
            )}
            {post.video_url && <NewsVideo url={post.video_url} />}
            <div className="mt-6 whitespace-pre-wrap font-sans leading-relaxed text-foreground/90">
              {lang === "my" ? post.body_my : post.body_en}
            </div>
            {Array.isArray(post.media_urls) && post.media_urls.length > 0 && (
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {post.media_urls.map((url: string, idx: number) => {
                  const isVideo = /\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(url);
                  return isVideo ? (
                    <video key={idx} src={url} controls className="w-full rounded-lg border border-border" />
                  ) : (
                    <img key={idx} src={url} alt="" className="w-full rounded-lg border border-border object-cover" />
                  );
                })}
              </div>
            )}
          </article>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function NewsVideo({ url }: { url: string }) {
  // Render YouTube/Vimeo as iframe; otherwise as <video>.
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (yt) {
    return (
      <div className="mt-6 aspect-video w-full overflow-hidden rounded-xl border border-border">
        <iframe
          src={`https://www.youtube.com/embed/${yt[1]}`}
          title="Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }
  if (vimeo) {
    return (
      <div className="mt-6 aspect-video w-full overflow-hidden rounded-xl border border-border">
        <iframe
          src={`https://player.vimeo.com/video/${vimeo[1]}`}
          title="Video"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }
  return (
    <div className="mt-6 w-full overflow-hidden rounded-xl border border-border bg-black">
      <video
        src={url}
        controls
        playsInline
        preload="metadata"
        className="h-full w-full"
      >
        <source src={url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
