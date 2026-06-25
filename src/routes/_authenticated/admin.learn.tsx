import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PlayCircle, Trash2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/admin/learn")({
  head: () => ({ meta: [{ title: "Admin · Learn videos — Lan Pwint" }] }),
  component: AdminLearn,
});

type Lesson = {
  id?: string;
  title: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  category: string | null;
  level: string | null;
  duration_minutes: number | null;
  published: boolean;
};

const empty: Lesson = {
  title: "",
  description: "",
  video_url: "",
  thumbnail_url: "",
  category: "",
  level: "beginner",
  duration_minutes: null,
  published: true,
};

function AdminLearn() {
  const { user } = useSession();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Lesson | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-lessons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function save() {
    if (!editing || !user) return;
    if (!editing.title.trim() || !editing.video_url?.trim()) {
      toast.error("Title and YouTube URL are required");
      return;
    }
    const youtubeId = extractYouTubeId(editing.video_url);
    const thumbnail = editing.thumbnail_url ||
      (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null);

    const payload = {
      ...editing,
      thumbnail_url: thumbnail,
      created_by: user.id,
    };
    const { error } = editing.id
      ? await supabase.from("lessons").update(payload).eq("id", editing.id)
      : await supabase.from("lessons").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing.id ? "Video updated" : "Video added");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-lessons"] });
    qc.invalidateQueries({ queryKey: ["student-lessons"] });
  }

  async function remove(id: string) {
    if (!confirm("Delete this video?")) return;
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-lessons"] });
    qc.invalidateQueries({ queryKey: ["student-lessons"] });
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-navy">Learn videos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Curated YouTube lessons surfaced on the student Learn page.
          </p>
        </div>
        {!editing && (
          <Button className="bg-navy text-navy-foreground hover:bg-deep" onClick={() => setEditing({ ...empty })}>
            Add new video
          </Button>
        )}
      </div>

      {editing && (
        <div className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title *"><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
            <Field label="YouTube URL *">
              <Input
                value={editing.video_url ?? ""}
                onChange={(e) => setEditing({ ...editing, video_url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </Field>
            <Field label="Category"><Input value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="Interview Tips, CV, Tech…" /></Field>
            <Field label="Level"><Input value={editing.level ?? ""} onChange={(e) => setEditing({ ...editing, level: e.target.value })} placeholder="beginner / intermediate / advanced" /></Field>
            <Field label="Duration (minutes)"><Input type="number" value={editing.duration_minutes ?? ""} onChange={(e) => setEditing({ ...editing, duration_minutes: e.target.value ? Number(e.target.value) : null })} /></Field>
            <Field label="Custom thumbnail URL (optional)"><Input value={editing.thumbnail_url ?? ""} onChange={(e) => setEditing({ ...editing, thumbnail_url: e.target.value })} placeholder="Leave empty to use YouTube thumbnail" /></Field>
          </div>
          <Field label="Description">
            <Textarea rows={4} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </Field>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={editing.published} onCheckedChange={(v) => setEditing({ ...editing, published: v })} />
              Published (visible to students)
            </label>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button className="bg-navy text-navy-foreground hover:bg-deep" onClick={save}>Save</Button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !data || data.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <PlayCircle className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 font-serif text-xl text-navy">No videos yet</p>
            <p className="text-sm text-muted-foreground">Add the first YouTube link above.</p>
          </div>
        ) : (
          data.map((l) => (
            <div key={l.id} className="overflow-hidden rounded-2xl border border-border bg-card">
              {l.thumbnail_url && (
                <img src={l.thumbnail_url} alt="" className="aspect-video w-full object-cover" />
              )}
              <div className="space-y-1.5 p-4">
                <p className="font-serif text-navy">{l.title}</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {l.category ?? "uncategorised"} {l.published ? "" : "· draft"}
                </p>
                {l.description && <p className="line-clamp-2 text-sm text-muted-foreground">{l.description}</p>}
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => setEditing(l as Lesson)}>
                    <Edit className="mr-1 h-3 w-3" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(l.id!)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m?.[1] ?? null;
}
