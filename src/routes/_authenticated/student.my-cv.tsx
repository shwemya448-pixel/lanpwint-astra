import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/student/my-cv")({
  head: () => ({ meta: [{ title: "My CV — Lan Pwint" }] }),
  component: MyCVPage,
});

function MyCVPage() {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const { data: files = [], isLoading } = useQuery({
    enabled: !!userId,
    queryKey: ["my-cvs", userId],
    queryFn: async () => {
      const { data, error } = await supabase.storage.from("cvs").list(userId!, {
        sortBy: { column: "created_at", order: "desc" },
        limit: 50,
      });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || !userId) return;
    setError(""); setMsg("");
    if (f.size > 10 * 1024 * 1024) { setError("File is larger than 10 MB."); return; }
    const ok = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png", "image/jpeg",
    ].includes(f.type);
    if (!ok) { setError("Use PDF, DOC, DOCX, PNG or JPG."); return; }
    setUploading(true);
    try {
      const path = `${userId}/${Date.now()}-${f.name.replace(/[^\w.\-]+/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("cvs").upload(path, f, {
        upsert: false, contentType: f.type,
      });
      if (upErr) throw upErr;
      setMsg("Uploaded successfully.");
      qc.invalidateQueries({ queryKey: ["my-cvs", userId] });
    } catch (err: any) {
      setError(err?.message ?? "Upload failed.");
    } finally { setUploading(false); }
  }

  async function download(name: string) {
    if (!userId) return;
    const { data, error } = await supabase.storage.from("cvs").createSignedUrl(`${userId}/${name}`, 60);
    if (error) { setError(error.message); return; }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  async function remove(name: string) {
    if (!userId) return;
    if (!confirm(`Delete ${name}?`)) return;
    const { error } = await supabase.storage.from("cvs").remove([`${userId}/${name}`]);
    if (error) { setError(error.message); return; }
    qc.invalidateQueries({ queryKey: ["my-cvs", userId] });
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lp-reveal">
        <p className="text-xs uppercase tracking-[0.22em] page-gold">My CV</p>
        <h1 className="mt-2 font-serif text-3xl text-navy sm:text-4xl">Manage your CV profile</h1>
        <p className="mt-3 text-muted-foreground">
          Upload your CV so employers on the CV Board can find you. PDF, DOC, DOCX, or image up to 10&nbsp;MB.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lp-reveal-stagger">
          <Link to="/profile" className="rounded-2xl border border-border bg-card p-6">
            <div className="font-serif text-lg text-navy">Edit profile</div>
            <div className="mt-1 text-sm text-muted-foreground">Skills, education, and bio.</div>
          </Link>
          <Link to="/student/cv-analyzer" className="rounded-2xl border border-border bg-card p-6">
            <div className="font-serif text-lg text-navy">Analyze my CV</div>
            <div className="mt-1 text-sm text-muted-foreground">Get AI feedback and a match score.</div>
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 lp-reveal">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-serif text-lg text-navy">Your CV files</div>
              <p className="mt-1 text-sm text-muted-foreground">Private — only you and employers you apply to can view.</p>
            </div>
            <div>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.doc,.docx,image/png,image/jpeg"
                className="sr-only"
                onChange={onPick}
              />
              <Button
                onClick={() => inputRef.current?.click()}
                disabled={uploading || !userId}
                className="lp-gold-btn"
              >
                {uploading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Upload className="mr-1.5 h-4 w-4" />}
                {uploading ? "Uploading…" : "Upload CV"}
              </Button>
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          {msg && <p className="mt-3 text-sm text-[color:var(--gold)]">{msg}</p>}

          <div className="mt-5">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : files.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <FileText className="mx-auto h-7 w-7 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No CV uploaded yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border rounded-xl border border-border">
                {files.map((f) => (
                  <li key={f.name} className="flex flex-wrap items-center justify-between gap-3 p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-5 w-5 text-[color:var(--gold)] shrink-0" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{f.name.replace(/^\d+-/, "")}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {f.created_at ? new Date(f.created_at).toLocaleString() : ""}
                          {f.metadata?.size ? ` · ${(f.metadata.size / 1024).toFixed(0)} KB` : ""}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => download(f.name)}>
                        <Download className="mr-1 h-3.5 w-3.5" /> Open
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(f.name)}>
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
