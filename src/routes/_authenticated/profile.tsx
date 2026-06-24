import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { PageShell, PageHeader } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "My profile — Lan Pwint" }] }),
  component: ProfilePage,
});

type EduItem = { school: string; degree: string; year: string };
type CertItem = { name: string; issuer: string; year: string; file?: string };

function ProfilePage() {
  const { user } = useSession();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  const [form, setForm] = useState({
    full_name: "",
    headline: "",
    school: "",
    degree: "",
    graduation_year: "",
    location: "",
    phone: "",
    bio: "",
    skillsText: "",
  });
  const [education, setEducation] = useState<EduItem[]>([]);
  const [certificates, setCertificates] = useState<CertItem[]>([]);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const cvRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    setForm({
      full_name: data.full_name ?? "",
      headline: data.headline ?? "",
      school: data.school ?? "",
      degree: data.degree ?? "",
      graduation_year: data.graduation_year?.toString() ?? "",
      location: data.location ?? "",
      phone: data.phone ?? "",
      bio: data.bio ?? "",
      skillsText: (data.skills ?? []).join(", "),
    });
    setEducation(Array.isArray(data.education) ? (data.education as any) : []);
    setCertificates(Array.isArray(data.certificates) ? (data.certificates as any) : []);
    setCvUrl(data.cv_url ?? null);
  }, [data]);

  async function uploadCv(file: File) {
    if (!user) return;
    const ext = file.name.split(".").pop() ?? "pdf";
    const path = `${user.id}/profile-cv.${ext}`;
    const { error } = await supabase.storage.from("cvs").upload(path, file, { upsert: true });
    if (error) return toast.error(error.message);
    setCvUrl(path);
    toast.success("CV uploaded");
  }

  async function save() {
    if (!user) return;
    setSaving(true);
    const skills = form.skillsText.split(",").map((s) => s.trim()).filter(Boolean);
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name || null,
      headline: form.headline || null,
      school: form.school || null,
      degree: form.degree || null,
      graduation_year: form.graduation_year ? Number(form.graduation_year) : null,
      location: form.location || null,
      phone: form.phone || null,
      bio: form.bio || null,
      skills,
      education: education as any,
      certificates: certificates as any,
      cv_url: cvUrl,
    }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Profile saved");
      qc.invalidateQueries({ queryKey: ["profile", user.id] });
    }
  }

  if (isLoading) {
    return <PageShell><div className="mx-auto max-w-4xl p-10">Loading…</div></PageShell>;
  }

  return (
    <PageShell>
      <PageHeader eyebrow="Your profile" title="Make yourself discoverable" description="Employers see this when you apply." />
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
        <Section title="Basic info">
          <Grid>
            <Field label="Full name"><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength={100} /></Field>
            <Field label="Headline"><Input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="e.g. CS undergraduate, aspiring backend dev" maxLength={140} /></Field>
            <Field label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} maxLength={80} /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={30} /></Field>
          </Grid>
          <Field label="Short bio"><Textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={500} /></Field>
        </Section>

        <Section title="Education">
          <Grid>
            <Field label="Current school / University"><Input value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} maxLength={120} /></Field>
            <Field label="Bachelor's / Degree"><Input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} maxLength={120} /></Field>
            <Field label="Graduation year"><Input type="number" value={form.graduation_year} onChange={(e) => setForm({ ...form, graduation_year: e.target.value })} /></Field>
          </Grid>
          <ListEditor
            label="Other education"
            items={education}
            onChange={setEducation}
            empty={{ school: "", degree: "", year: "" }}
            fields={[
              { key: "school", label: "School" },
              { key: "degree", label: "Degree" },
              { key: "year", label: "Year" },
            ]}
          />
        </Section>

        <Section title="Skills">
          <Field label="Comma-separated">
            <Input value={form.skillsText} onChange={(e) => setForm({ ...form, skillsText: e.target.value })} placeholder="React, TypeScript, SQL, Figma" maxLength={500} />
          </Field>
        </Section>

        <Section title="Certificates">
          <ListEditor
            label=""
            items={certificates}
            onChange={setCertificates as any}
            empty={{ name: "", issuer: "", year: "" }}
            fields={[
              { key: "name", label: "Certificate name" },
              { key: "issuer", label: "Issued by" },
              { key: "year", label: "Year" },
            ]}
          />
        </Section>

        <Section title="CV / Resume">
          <div className="flex flex-wrap items-center gap-3">
            <input ref={cvRef} type="file" accept=".pdf,.doc,.docx" hidden onChange={(e) => e.target.files?.[0] && uploadCv(e.target.files[0])} />
            <Button type="button" variant="outline" onClick={() => cvRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" /> Upload CV
            </Button>
            <span className="text-sm text-muted-foreground">{cvUrl ? cvUrl.split("/").pop() : "No CV uploaded"}</span>
          </div>
        </Section>

        <div className="flex justify-end">
          <Button onClick={save} disabled={saving} className="bg-navy text-navy-foreground hover:bg-deep">
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </section>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-serif text-xl text-navy">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5">{label && <Label>{label}</Label>}{children}</div>;
}

function ListEditor<T extends Record<string, string>>({
  label, items, onChange, empty, fields,
}: {
  label: string; items: T[]; onChange: (v: T[]) => void; empty: T;
  fields: { key: keyof T; label: string }[];
}) {
  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}
      {items.map((it, i) => (
        <div key={i} className="grid grid-cols-1 gap-2 rounded-md border border-border p-3 md:grid-cols-[1fr_1fr_120px_auto]">
          {fields.map((f) => (
            <Input
              key={String(f.key)}
              placeholder={f.label}
              value={it[f.key] ?? ""}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], [f.key]: e.target.value };
                onChange(next);
              }}
            />
          ))}
          <Button variant="ghost" size="icon" onClick={() => onChange(items.filter((_, j) => j !== i))}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onChange([...items, { ...empty }])}>
        <Plus className="mr-1 h-4 w-4" /> Add
      </Button>
    </div>
  );
}
