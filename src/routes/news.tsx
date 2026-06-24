import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useLocale } from "@/lib/i18n";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News & Announcements — Lan Pwint" },
      { name: "description", content: "Latest news, jobs, events and career tips from Lan Pwint." },
      { property: "og:title", content: "News & Announcements — Lan Pwint" },
      { property: "og:description", content: "Latest news, jobs, events and career tips." },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  const { t, lang } = useLocale();
  const [cat, setCat] = useState<string | null>(null);

  const { data: cats = [] } = useQuery({
    queryKey: ["news_categories"],
    queryFn: async () => (await supabase.from("news_categories").select("*").order("name_en")).data ?? [],
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["news_posts", cat],
    queryFn: async () => {
      let q = supabase.from("news_posts").select("*, news_categories(slug,name_en,name_my)").eq("published", true).order("published_at", { ascending: false });
      if (cat) q = q.eq("category_id", cat);
      return (await q).data ?? [];
    },
  });

  return (
    <div className="min-h-screen flex flex-col inner-page">
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="font-serif text-4xl md:text-5xl page-gold">{t("news.title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("news.subtitle")}</p>
        </header>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setCat(null)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              cat === null ? "border-[color:var(--gold)] bg-[color:var(--gold)]/15 text-[color:var(--gold)]" : "border-border hover:bg-muted"
            }`}
          >
            {t("news.allCategories")}
          </button>
          {cats.map((c: any) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                cat === c.id ? "border-[color:var(--gold)] bg-[color:var(--gold)]/15 text-[color:var(--gold)]" : "border-border hover:bg-muted"
              }`}
            >
              {lang === "my" ? c.name_my : c.name_en}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">{t("common.loading")}</p>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground">{t("news.empty")}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p: any) => (
              <Link
                key={p.id}
                to="/news/$slug"
                params={{ slug: p.slug }}
                className="group rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-[color:var(--gold)]/60 hover:shadow-[0_8px_30px_-12px_color-mix(in_oklab,var(--gold)_30%,transparent)]"
              >
                {p.image_url && (
                  <div className="aspect-video overflow-hidden bg-muted">
                    <img src={p.image_url} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                )}
                <div className="p-5">
                  {p.news_categories && (
                    <div className="text-xs uppercase tracking-wider text-[color:var(--gold)]">
                      {lang === "my" ? p.news_categories.name_my : p.news_categories.name_en}
                    </div>
                  )}
                  <h2 className="mt-2 font-serif text-xl text-foreground group-hover:text-[color:var(--gold)] transition-colors">
                    {lang === "my" ? p.title_my : p.title_en}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                    {lang === "my" ? p.excerpt_my : p.excerpt_en}
                  </p>
                  <div className="mt-3 text-xs text-muted-foreground">
                    {new Date(p.published_at).toLocaleDateString(lang === "my" ? "my-MM" : "en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
