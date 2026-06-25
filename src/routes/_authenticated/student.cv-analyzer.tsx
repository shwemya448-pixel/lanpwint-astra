import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Camera, FileText, Image as ImageIcon, Loader2, RotateCw, Sparkles, Upload, X } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askGemini } from "@/lib/ai-gemini.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/student/cv-analyzer")({
  head: () => ({ meta: [{ title: "CV Analyzer — Lan Pwint" }] }),
  component: CVAnalyzerPage,
});

const SYSTEM = `You are a senior recruiter. Analyze the candidate's CV (text or image) and reply with STRICT JSON only — no markdown, no commentary.

Schema:
{
  "overall_score": number (0-100),
  "verdict": string (one short sentence),
  "scores": {
    "clarity": number (0-100),
    "experience": number (0-100),
    "skills": number (0-100),
    "education": number (0-100),
    "impact": number (0-100)
  },
  "strengths": string[] (max 4, each <= 14 words),
  "weaknesses": string[] (max 4, each <= 14 words),
  "improvements": string[] (max 4, each <= 18 words, actionable),
  "role_match": number | null (0-100, only if a target role is given, else null),
  "role_match_reason": string | null
}

Keep each bullet short and concrete. Reply in the CV's language (English or Burmese).`;

type CVReport = {
  overall_score: number;
  verdict: string;
  scores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  role_match: number | null;
  role_match_reason: string | null;
};

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
  const [result, setResult] = useState<CVReport | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Camera
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camOpen, setCamOpen] = useState(false);
  const [camReady, setCamReady] = useState(false);
  const [camError, setCamError] = useState("");
  const [facing, setFacing] = useState<"environment" | "user">("environment");

  useEffect(() => () => stopCamera(), []);

  async function openCamera(mode: "environment" | "user" = facing) {
    setCamError("");
    setCamReady(false);
    stopCamera();
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamError("This browser does not support camera access.");
      return;
    }
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: mode }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
      } catch {
        // Fallback to any camera
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      streamRef.current = stream;
      setFacing(mode);
      setCamOpen(true);
      requestAnimationFrame(() => {
        const v = videoRef.current;
        if (!v) return;
        v.srcObject = stream;
        v.onloadedmetadata = () => {
          v.play().then(() => setCamReady(true)).catch(() => setCamReady(true));
        };
      });
    } catch (e: any) {
      const msg = e?.name === "NotAllowedError"
        ? "Camera permission was blocked. Allow it in your browser settings, then try again."
        : e?.name === "NotFoundError"
        ? "No camera was found on this device."
        : e?.message ?? "Camera not available.";
      setCamError(msg);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamOpen(false);
    setCamReady(false);
  }

  function switchCamera() {
    openCamera(facing === "environment" ? "user" : "environment");
  }

  function capture() {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setImageDataUrl(dataUrl);
    setImageName("camera-capture.jpg");
    stopCamera();
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 6 * 1024 * 1024) { setError("Image is larger than 6 MB."); return; }
    setError("");
    const url = await fileToDataUrl(f);
    setImageDataUrl(url);
    setImageName(f.name);
  }

  async function analyze() {
    setError(""); setResult("");
    if (!cvText.trim() && !imageDataUrl) {
      setError("Add CV text, upload a photo, or capture one with the camera.");
      return;
    }
    setLoading(true);
    try {
      const prompt = [
        target ? `Target role / job description:\n${target}` : "",
        cvText ? `CV text:\n${cvText}` : "CV is provided as an image.",
      ].filter(Boolean).join("\n\n");
      const res = await ask({
        data: { system: SYSTEM, prompt, imageDataUrl: imageDataUrl ?? undefined },
      });
      setResult(res.content || "No response received.");
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong.");
    } finally { setLoading(false); }
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lp-reveal">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card">
            <Sparkles className="h-4 w-4 text-[color:var(--gold)]" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] page-gold">CV Analyzer</p>
            <h1 className="font-serif text-3xl text-navy sm:text-4xl">AI feedback on your CV</h1>
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Paste your CV, upload a photo, or use your camera. Optionally add a target role to get a match score.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2 lp-reveal-stagger">
          {/* Left: text + target */}
          <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <FileText className="h-3.5 w-3.5" /> Step 1 — Paste or upload
            </div>
            <div>
              <label className="text-sm font-medium text-navy">CV text</label>
              <Textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Paste your CV here…"
                className="mt-2 min-h-[200px]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-navy">Target role <span className="font-normal text-muted-foreground">(optional)</span></label>
              <Textarea
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Paste the job description you want to match against…"
                className="mt-2 min-h-[90px]"
              />
            </div>
          </div>

          {/* Right: image capture */}
          <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <ImageIcon className="h-3.5 w-3.5" /> Step 2 — Or use a photo
            </div>

            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:border-[color:var(--gold)]">
                <Upload className="h-4 w-4" /> Upload image
                <input type="file" accept="image/*" className="sr-only" onChange={onPickFile} />
              </label>
              {!camOpen ? (
                <Button type="button" variant="outline" size="sm" onClick={() => openCamera()}>
                  <Camera className="mr-1.5 h-4 w-4" /> Use camera
                </Button>
              ) : (
                <>
                  <Button type="button" variant="outline" size="sm" onClick={switchCamera}>
                    <RotateCw className="mr-1.5 h-4 w-4" /> Switch
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={stopCamera}>
                    <X className="mr-1.5 h-4 w-4" /> Close
                  </Button>
                </>
              )}
              {imageDataUrl && !camOpen && (
                <Button type="button" variant="ghost" size="sm" onClick={() => { setImageDataUrl(null); setImageName(null); }}>
                  <X className="mr-1.5 h-4 w-4" /> Remove
                </Button>
              )}
            </div>
            {camError && <p className="text-xs text-destructive">{camError}</p>}

            {camOpen && (
              <div className="overflow-hidden rounded-xl border border-border bg-black">
                <div className="relative aspect-video w-full">
                  <video
                    ref={videoRef}
                    className="absolute inset-0 h-full w-full object-cover"
                    muted
                    autoPlay
                    playsInline
                  />
                  {!camReady && (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-white/80">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting camera…
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-3 rounded-lg border border-[color:var(--gold)]/60" />
                </div>
                <div className="flex items-center justify-center gap-2 border-t border-border bg-card p-3">
                  <Button type="button" onClick={capture} disabled={!camReady} className="lp-gold-btn">
                    <Camera className="mr-1.5 h-4 w-4" /> Capture
                  </Button>
                </div>
              </div>
            )}

            {imageDataUrl && !camOpen && (
              <div className="overflow-hidden rounded-xl border border-border">
                <img src={imageDataUrl} alt={imageName ?? "CV"} className="max-h-[280px] w-full object-contain bg-black/50" />
                <div className="border-t border-border px-3 py-1.5 text-[11px] text-muted-foreground">{imageName}</div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={analyze} disabled={loading} className="lp-gold-btn">
            {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4" />}
            {loading ? "Analyzing…" : "Analyze with AI"}
          </Button>
          {error && <span className="text-sm text-destructive">{error}</span>}
        </div>

        {result && (
          <article className={cn("mt-8 rounded-2xl border border-border bg-card p-6 lp-reveal")}>
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
