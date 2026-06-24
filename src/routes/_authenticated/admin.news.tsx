import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useSession, useUserRoles } from "@/lib/auth";
import { useLocale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/news")({
  component: AdminNews,
});

type Post = {
  id: string;
  slug: string;
  title_en: string;
  title_my: string;
  excerpt_en: string | null;
  excerpt_my: string | null;
  body_en: string;
  body_my: string;
  image_url: string | null;
  category_id: string | null;
  published: boolean;
  published_at: string;
};

const emptyPost: Partial<Post> = {
  slug: "",
  title_en: "",
  title_my: "",
  excerpt_en: "",
  excerpt_my: "",
  body_en: "",
  body_my: "",
  image_url: "",
  category_id: null,
  published: true,
};

function AdminNews() {
  const { user } = useSession();
  const roles = useUserRoles(user);
  const navigate = useNavigate();
  const { t, lang } = useLocale();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Post> | null>(null);

  useEffect(() => {
    if (user && roles.length > 0 && !roles.includes("admin")) {
      toast.error("Admin only");
      navigate({ to: "/dashboard" });
    }
  }, [user, roles, navigate]);

  const { data: cats = [] } = useQuery({
    queryKey: ["news_categories"],
    queryFn: async () => (await supabase.from("news_categories").select("*").order("name_en")).data ?? [],
  });

  const { data: posts = [], refetch } = useQuery({
    queryKey: ["admin_news_posts"],
    queryFn: async () => (await supabase.from("news_posts").select("*").order("created_at", { ascending: false })).data ?? [],
    enabled: roles.includes("admin"),
  });

  async function save() {
    if (!editing) return;
    if (!editing.slug || !editing.title_en || !editing.title_my || !editing.body_en || !editing.body_my) {
      toast.error("Please fill all required fields");
      return;
    }
    const payload = {
      slug: editing.slug!,
      title_en: editing.title_en!,
      title_my: editing.title_my!,
      excerpt_en: editing.excerpt_en || null,
      excerpt_my: editing.excerpt_my || null,
      body_en: editing.body_en!,
      body_my: editing.body_my!,
      image_url: editing.image_url || null,
      category_id: editing.category_id || null,
      published: editing.published ?? true,
      author_id: user?.id,
    };
    const { error } = editing.id
      ? await supabase.from("news_posts").update(payload).eq("id", editing.id)
      : await supabase.from("news_posts").insert(payload);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("common.saved"));
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin_news_posts"] });
    qc.invalidateQueries({ queryKey: ["news_posts"] });
    refetch();
  }

  async function remove(id: string) {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("news_posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refetch();
  }

  if (!user || !roles.includes("admin")) {
    return (
      <div className="min-h-screen grid place-items-center">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col inner-page">
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="font-serif text-3xl page-gold">{t("admin.news.title")}</h1>
          <Button
            onClick={() => setEditing({ ...emptyPost })}
            className="bg-[color:var(--gold)] text-[color:var(--navy)] hover:brightness-110"
          >
            <Plus className="mr-1.5 h-4 w-4" /> {t("admin.news.new")}
          </Button>
        </div>

        {editing && (
          <div className="mt-6 rounded-xl border border-[color:var(--gold)]/40 bg-card p-5 space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label={t("admin.form.titleEn")} value={editing.title_en ?? ""} onChange={(v) => setEditing({ ...editing, title_en: v })} />
              <Field label={t("admin.form.titleMy")} value={editing.title_my ?? ""} onChange={(v) => setEditing({ ...editing, title_my: v })} />
              <Field
                label={t("admin.form.slug")}
                value={editing.slug ?? ""}
                onChange={(v) => setEditing({ ...editing, slug: v.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") })}
              />
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">{t("admin.form.category")}</label>
                <select
                  value={editing.category_id ?? ""}
                  onChange={(e) => setEditing({ ...editing, category_id: e.target.value || null })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">—</option>
                  {cats.map((c: any) => (
                    <option key={c.id} value={c.id}>{lang === "my" ? c.name_my : c.name_en}</option>
                  ))}
                </select>
              </div>
              <Field label={t("admin.form.excerptEn")} value={editing.excerpt_en ?? ""} onChange={(v) => setEditing({ ...editing, excerpt_en: v })} />
              <Field label={t("admin.form.excerptMy")} value={editing.excerpt_my ?? ""} onChange={(v) => setEditing({ ...editing, excerpt_my: v })} />
              <Field label={t("admin.form.imageUrl")} value={editing.image_url ?? ""} onChange={(v) => setEditing({ ...editing, image_url: v })} className="md:col-span-2" />
              <Textarea label={t("admin.form.bodyEn")} value={editing.body_en ?? ""} onChange={(v) => setEditing({ ...editing, body_en: v })} />
              <Textarea label={t("admin.form.bodyMy")} value={editing.body_my ?? ""} onChange={(v) => setEditing({ ...editing, body_my: v })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.published ?? true} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
              {t("admin.form.publish")}
            </label>
            <div className="flex gap-2">
              <Button onClick={save} className="bg-[color:var(--gold)] text-[color:var(--navy)] hover:brightness-110">{t("admin.form.save")}</Button>
              <Button variant="outline" onClick={() => setEditing(null)}>{t("admin.form.cancel")}</Button>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-2">
          {posts.length === 0 && <p className="text-muted-foreground">No posts yet.</p>}
          {posts.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
              <div className="min-w-0">
                <div className="font-serif text-lg truncate text-foreground">{lang === "my" ? p.title_my : p.title_en}</div>
                <div className="text-xs text-muted-foreground">
                  /{p.slug} ·{" "}
                  <span className={p.published ? "text-[color:var(--gold)]" : "text-muted-foreground"}>
                    {p.published ? t("admin.news.published") : t("admin.news.draft")}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button size="sm" variant="outline" onClick={() => setEditing(p)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => remove(p.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({ label, value, onChange, className = "" }: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
    </div>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="md:col-span-2">
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-sans"
      />
    </div>
  );
}
