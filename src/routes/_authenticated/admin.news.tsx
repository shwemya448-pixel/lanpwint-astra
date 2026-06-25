import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Upload, X, Video, Image as ImageIcon, Loader2 } from "lucide-react";
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
  video_url: string | null;
  media_urls: string[];
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
  video_url: "",
  media_urls: [],
  category_id: null,
  published: true,
};

const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 5; // 5 years

async function uploadNewsFile(file: File, userId: string): Promise<string | null> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("news-media").upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) {
    toast.error(error.message);
    return null;
  }
  const { data, error: signErr } = await supabase.storage
    .from("news-media")
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (signErr || !data) {
    toast.error(signErr?.message ?? "Failed to sign URL");
    return null;
  }
  return data.signedUrl;
}

function AdminNews() {
  const { user } = useSession();
  const roles = useUserRoles(user);
  const navigate = useNavigate();
  const { t, lang } = useLocale();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Post> | null>(null);
  const [busyField, setBusyField] = useState<null | "cover" | "video" | "gallery">(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

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
    queryFn: async () =>
      (await supabase.from("news_posts").select("*").order("created_at", { ascending: false })).data ?? [],
    enabled: roles.includes("admin"),
  });

  async function handleCoverUpload(file: File) {
    if (!user) return;
    setBusyField("cover");
    const url = await uploadNewsFile(file, user.id);
    setBusyField(null);
    if (url) setEditing((e) => (e ? { ...e, image_url: url } : e));
  }

  async function handleVideoUpload(file: File) {
    if (!user) return;
    setBusyField("video");
    const url = await uploadNewsFile(file, user.id);
    setBusyField(null);
    if (url) setEditing((e) => (e ? { ...e, video_url: url } : e));
  }

  async function handleGalleryUpload(files: FileList | null) {
    if (!user || !files || files.length === 0) return;
    setBusyField("gallery");
    const urls: string[] = [];
    for (const f of Array.from(files)) {
      const u = await uploadNewsFile(f, user.id);
      if (u) urls.push(u);
    }
    setBusyField(null);
    if (urls.length > 0) {
      setEditing((e) =>
        e ? { ...e, media_urls: [...(e.media_urls ?? []), ...urls] } : e,
      );
    }
  }

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
      video_url: editing.video_url || null,
      media_urls: editing.media_urls ?? [],
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
          <div className="mt-6 rounded-xl border border-[color:var(--gold)]/40 bg-card p-5 space-y-5">
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
            </div>

            {/* Cover image */}
            <div className="rounded-lg border border-border bg-background/40 p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ImageIcon className="h-4 w-4 text-[color:var(--gold)]" /> Cover image
                </div>
                <div className="flex gap-2">
                  <input
                    ref={coverRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
                  />
                  <Button type="button" size="sm" variant="outline" onClick={() => coverRef.current?.click()} disabled={busyField === "cover"}>
                    {busyField === "cover" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1.5 h-3.5 w-3.5" />}
                    Upload
                  </Button>
                </div>
              </div>
              <input
                value={editing.image_url ?? ""}
                onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                placeholder="…or paste an image URL"
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              {editing.image_url && (
                <img src={editing.image_url} alt="" className="mt-3 max-h-44 rounded-md border border-border object-cover" />
              )}
            </div>

            {/* Video */}
            <div className="rounded-lg border border-border bg-background/40 p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Video className="h-4 w-4 text-[color:var(--gold)]" /> Video
                </div>
                <div className="flex gap-2">
                  <input
                    ref={videoRef}
                    type="file"
                    accept="video/*"
                    hidden
                    onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                  />
                  <Button type="button" size="sm" variant="outline" onClick={() => videoRef.current?.click()} disabled={busyField === "video"}>
                    {busyField === "video" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1.5 h-3.5 w-3.5" />}
                    Upload
                  </Button>
                </div>
              </div>
              <input
                value={editing.video_url ?? ""}
                onChange={(e) => setEditing({ ...editing, video_url: e.target.value })}
                placeholder="…or paste a YouTube / video URL"
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              {editing.video_url && (
                <video src={editing.video_url} controls className="mt-3 max-h-56 w-full rounded-md border border-border" />
              )}
            </div>

            {/* Gallery */}
            <div className="rounded-lg border border-border bg-background/40 p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ImageIcon className="h-4 w-4 text-[color:var(--gold)]" /> Photo gallery
                  <span className="text-xs text-muted-foreground">({editing.media_urls?.length ?? 0})</span>
                </div>
                <div className="flex gap-2">
                  <input
                    ref={galleryRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    hidden
                    onChange={(e) => handleGalleryUpload(e.target.files)}
                  />
                  <Button type="button" size="sm" variant="outline" onClick={() => galleryRef.current?.click()} disabled={busyField === "gallery"}>
                    {busyField === "gallery" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1.5 h-3.5 w-3.5" />}
                    Add media
                  </Button>
                </div>
              </div>
              {editing.media_urls && editing.media_urls.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {editing.media_urls.map((url, idx) => {
                    const isVideo = /\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(url);
                    return (
                      <div key={idx} className="relative overflow-hidden rounded-md border border-border bg-muted/30">
                        {isVideo ? (
                          <video src={url} className="h-24 w-full object-cover" />
                        ) : (
                          <img src={url} alt="" className="h-24 w-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setEditing({
                              ...editing,
                              media_urls: (editing.media_urls ?? []).filter((_, i) => i !== idx),
                            })
                          }
                          className="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-background/85 text-foreground shadow hover:bg-destructive hover:text-destructive-foreground"
                          aria-label="Remove"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
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
                  {p.video_url && <span className="ml-2 inline-flex items-center gap-1"><Video className="h-3 w-3" />video</span>}
                  {p.media_urls?.length > 0 && <span className="ml-2 inline-flex items-center gap-1"><ImageIcon className="h-3 w-3" />{p.media_urls.length}</span>}
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
    <div>
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
