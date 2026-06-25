import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Camera, Loader2, Sparkles, Upload, X } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askGemini } from "@/lib/ai-gemini.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/student/cv-analyzer")({
  head: () => ({ meta: [{ title: "CV Analyzer — Lan Pwint" }] }),
  component: CVAnalyzerPage,
});

const SYSTEM = `You are a senior recruiter and career coach.
Given a candidate's CV (as text or an image), produce a JSON-like markdown report with:
**Score** (0-100), **Strengths** (bullets), **Weaknesses** (bullets),
**Suggested improvements** (bullets), and a short **Overall summary** (2-3 lines).
If a target job is provided, end with **Match for this role**: <0-100>% and a one-line reason.
Be specific, kind, and concrete. Burmese students may share Burmese text — reply in the same language as the CV.`;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function CVAnalyzerPage() {
  const ask = useServerFn(askGemini);
  const [cvText, setCvText] = useState("");
  const [target, setTarget] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Camera
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camOpen, setCamOpen] = useState(false);
  const [camError, setCamError] = useState("");

  useEffect(() => {
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function openCamera() {
    setCamError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      setCamOpen(true);
      // Attach in a microtask after the video element mounts
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 0);
    } catch (e: any) {
      setCamError(e?.message ?? "Camera not available. Allow camera access in your browser.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamOpen(false);
  }

  function capture() {
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth || 1280;
    canvas.height = v.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setImageDataUrl(dataUrl);
    setImageName("camera-capture.jpg");
    stopCamera();
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 6 * 1024 * 1024) {
      setError("Image is larger than 6 MB. Pick a smaller one.");
      return;
    }
    setError("");
    const url = await fileToDataUrl(f);
    setImageDataUrl(url);
    setImageName(f.name);
  }

  async function analyze() {
    setError("");
    setResult("");
    if (!cvText.trim() && !imageDataUrl) {
      setError("Add CV text, upload a CV photo, or capture one with the camera.");
      return;
    }
    setLoading(true);
    try {
      const prompt = [
        target ? `Target role / job description:\n${target}` : "",
        cvText ? `CV text:\n${cvText}` : "CV is provided as an image.",
      ].filter(Boolean).join("\n\n");
      const res = await ask({
        data: {
          system: SYSTEM,
          prompt,
          imageDataUrl: imageDataUrl ?? undefined,
        },
      });
      setResult(res.content || "No response received.");
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lp-reveal">
        <p className="text-xs uppercase tracking-[0.22em] page-gold">CV Analyzer</p>
        <h1 className="mt-2 font-serif text-3xl text-navy sm:text-4xl">AI feedback on your CV</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Paste your CV, upload a photo, or use your camera. Optionally add a target role for a match score.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2 lp-reveal-stagger">
          <div className="space-y-4 rounded-2xl border bg-card p-6">
            <div>
              <label className="text-sm font-medium text-navy">CV text</label>
              <Textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Paste your CV here…"
                className="mt-2 min-h-[180px]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-navy">Target role (optional)</label>
              <Textarea
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Paste the job description you want to match against…"
                className="mt-2 min-h-[80px]"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border bg-card p-6">
            <div>
              <label className="text-sm font-medium text-navy">CV photo</label>
              <p className="text-xs text-muted-foreground">JPG or PNG, under 6 MB. The AI will read the image directly.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm hover:bg-muted">
                  <Upload className="h-4 w-4" /> Upload image
                  <input type="file" accept="image/*" className="sr-only" onChange={onPickFile} />
                </label>
                {!camOpen ? (
                  <Button type="button" variant="outline" size="sm" onClick={openCamera}>
                    <Camera className="mr-1.5 h-4 w-4" /> Use camera
                  </Button>
                ) : (
                  <Button type="button" variant="outline" size="sm" onClick={stopCamera}>
                    <X className="mr-1.5 h-4 w-4" /> Close camera
                  </Button>
                )}
                {imageDataUrl && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setImageDataUrl(null); setImageName(null); }}>
                    <X className="mr-1.5 h-4 w-4" /> Remove image
                  </Button>
                )}
              </div>
              {camError && <p className="mt-2 text-xs text-destructive">{camError}</p>}
            </div>

            {camOpen && (
              <div className="overflow-hidden rounded-xl border">
                <video ref={videoRef} className="aspect-video w-full bg-black" muted playsInline />
                <div className="flex justify-center border-t bg-card p-2">
                  <Button type="button" onClick={capture} className="lp-gold-btn">
                    <Camera className="mr-1.5 h-4 w-4" /> Capture photo
                  </Button>
                </div>
              </div>
            )}

            {imageDataUrl && !camOpen && (
              <div className="overflow-hidden rounded-xl border">
                <img src={imageDataUrl} alt={imageName ?? "CV"} className="max-h-[260px] w-full object-contain bg-black/40" />
                <div className="border-t px-3 py-1.5 text-[11px] text-muted-foreground">{imageName}</div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button onClick={analyze} disabled={loading} className="lp-gold-btn">
            {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4" />}
            {loading ? "Analyzing…" : "Analyze with AI"}
          </Button>
          {error && <span className="text-sm text-destructive">{error}</span>}
        </div>

        {result && (
          <article className={cn("mt-8 rounded-2xl border bg-card p-6 lp-reveal")}>
            <h2 className="font-serif text-2xl text-navy">AI report</h2>
            <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
              {result}
            </pre>
          </article>
        )}
      </section>
    </PageShell>
  );
}
