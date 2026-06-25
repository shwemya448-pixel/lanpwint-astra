import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ArrowRight, Briefcase, GraduationCap, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import logoMark from "@/assets/logo-mark.png";
import animeMascot from "@/assets/anime-mascot.png";

const search = z.object({
  as: z.enum(["student", "employer"]).optional().default("student"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Sign in — Lan Pwint" },
      { name: "description", content: "Sign in or create an account on Lan Pwint." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { as } = Route.useSearch();
  const navigate = useNavigate();
  const [role, setRole] = useState<"student" | "employer">(as);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => setRole(as), [as]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: name, role },
          },
        });
        if (error) throw error;
        if (role === "employer" && signUpData.user) {
          await supabase
            .from("profiles")
            .update({
              company_name: companyName || null,
              position: position || null,
            } as any)
            .eq("id", signUpData.user.id);
        }
        toast.success("Account created. Check your email if confirmation is required.");
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error instanceof Error ? result.error.message : "Google sign-in failed");
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/dashboard" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-stage relative min-h-screen overflow-hidden bg-[#06101f] text-white">
      {/* Animated cosmos backdrop */}
      <div className="auth-cosmos" aria-hidden />
      <div className="auth-stars" aria-hidden />
      <div className="auth-grid-lines" aria-hidden />

      {/* Floating decorative shapes */}
      <div className="auth-orb auth-orb-1" aria-hidden />
      <div className="auth-orb auth-orb-2" aria-hidden />
      <div className="auth-orb auth-orb-3" aria-hidden />

      {/* Flying anime mascot */}
      <img
        src={animeMascot}
        alt=""
        aria-hidden
        className="auth-mascot pointer-events-none select-none"
      />
      <span className="auth-mascot-trail auth-mascot-trail-1" aria-hidden />
      <span className="auth-mascot-trail auth-mascot-trail-2" aria-hidden />
      <span className="auth-mascot-trail auth-mascot-trail-3" aria-hidden />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        {/* Left: brand showcase */}
        <div className="relative hidden flex-col justify-between p-10 lg:flex xl:p-16">
          <Link to="/" className="inline-flex items-center gap-3 self-start">
            <span className="lp-logo-mark h-12 w-12">
              <img src={logoMark} alt="Lan Pwint" width={48} height={48} className="h-12 w-12 rounded-full object-contain" />
            </span>
            <div className="leading-tight">
              <div className="font-serif text-base">Lan Pwint</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold)]/80">လမ်းပွင့်</div>
            </div>
          </Link>

          {/* Rotating logo monument */}
          <div className="relative mx-auto my-10 flex h-[340px] w-[340px] items-center justify-center xl:h-[400px] xl:w-[400px]">
            <div className="auth-ring auth-ring-outer" />
            <div className="auth-ring auth-ring-mid" />
            <div className="auth-ring auth-ring-inner" />
            <div className="auth-logo-glow" />
            <img
              src={logoMark}
              alt=""
              aria-hidden
              className="relative z-10 h-56 w-56 rounded-full object-contain drop-shadow-[0_20px_60px_rgba(212,162,86,0.45)] xl:h-64 xl:w-64 auth-logo-breathe"
            />
            <span className="auth-spark auth-spark-1" />
            <span className="auth-spark auth-spark-2" />
            <span className="auth-spark auth-spark-3" />
            <span className="auth-spark auth-spark-4" />
          </div>

          <div>
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-[color:var(--gold)]/85">
              <Sparkles className="h-3.5 w-3.5" /> The road opens here
            </p>
            <h1 className="mt-4 font-serif text-4xl leading-[1.05] xl:text-5xl">
              <span className="auth-word">Learn.</span>{" "}
              <span className="auth-word" style={{ animationDelay: "0.15s" }}>Apply.</span>{" "}
              <span className="auth-word" style={{ animationDelay: "0.3s" }}>Rise.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm text-white/70">
              Join thousands of candidates, graduates, and employers walking the same road toward
              meaningful work.
            </p>

            <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
              <Stat label="Candidates" value="12K" />
              <Stat label="Employers" value="480" />
              <Stat label="Placements" value="3.2K" />
            </div>
          </div>

          <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">
            © {new Date().getFullYear()} Lan Pwint · Yangon, Myanmar
          </div>
        </div>

        {/* Right: form card */}
        <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:py-16">
          <div className="auth-card relative w-full max-w-md">
            <div className="auth-card-border" aria-hidden />
            <div className="relative rounded-[26px] bg-[#0b1830]/85 p-6 backdrop-blur-2xl sm:p-9">
              <Link
                to="/"
                className="inline-flex items-center gap-2 self-start text-xs uppercase tracking-[0.2em] text-white/55 transition-colors hover:text-[color:var(--gold)] lg:hidden"
              >
                <span className="lp-logo-mark h-9 w-9">
                  <img src={logoMark} alt="" className="h-9 w-9 rounded-full object-contain" />
                </span>
                Lan Pwint
              </Link>

              <h2 className="mt-2 font-serif text-3xl text-white sm:text-4xl">
                {mode === "signin" ? "Welcome back" : "Begin the journey"}
              </h2>
              <p className="mt-2 text-sm text-white/60">
                {mode === "signin"
                  ? "Sign in to pick up where you left off."
                  : "Create your account in less than a minute."}
              </p>

              {/* Role */}
              <div className="mt-7">
                <Label className="text-[10px] uppercase tracking-[0.22em] text-white/55">I am a</Label>
                <div className="mt-2 grid grid-cols-2 gap-2.5">
                  <RoleButton active={role === "student"} onClick={() => setRole("student")} icon={GraduationCap} label="Candidate" />
                  <RoleButton active={role === "employer"} onClick={() => setRole("employer")} icon={Briefcase} label="Employer" />
                </div>
              </div>

              <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")} className="mt-6">
                <TabsList className="grid w-full grid-cols-2 rounded-full border border-white/10 bg-white/5 p-1">
                  <TabsTrigger
                    value="signin"
                    className="rounded-full text-xs uppercase tracking-[0.18em] text-white/60 data-[state=active]:bg-[color:var(--gold)] data-[state=active]:text-[#0b1830] data-[state=active]:shadow-[0_8px_28px_-12px_rgba(212,162,86,0.7)]"
                  >
                    Sign in
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="rounded-full text-xs uppercase tracking-[0.18em] text-white/60 data-[state=active]:bg-[color:var(--gold)] data-[state=active]:text-[#0b1830] data-[state=active]:shadow-[0_8px_28px_-12px_rgba(212,162,86,0.7)]"
                  >
                    Create
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="mt-5 animate-fade-in">
                  <form onSubmit={handleEmail} className="space-y-4">
                    <GlowField id="email1" label="Email" type="email" value={email} onChange={setEmail} required />
                    <GlowField id="pw1" label="Password" type="password" value={password} onChange={setPassword} required />
                    <PrimaryButton busy={busy}>Sign in</PrimaryButton>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-5 animate-fade-in">
                  <form onSubmit={handleEmail} className="space-y-4">
                    <GlowField id="name" label="Full name" value={name} onChange={setName} required />
                    <GlowField id="email2" label="Email" type="email" value={email} onChange={setEmail} required />
                    {role === "employer" && (
                      <div className="space-y-4 animate-fade-in">
                        <GlowField id="company" label="Company name" value={companyName} onChange={setCompanyName} required />
                        <GlowField id="position" label="Your position" value={position} onChange={setPosition} required />
                      </div>
                    )}
                    <GlowField id="pw2" label="Password" type="password" value={password} onChange={setPassword} required minLength={6} />
                    <PrimaryButton busy={busy}>Create account</PrimaryButton>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-white/35">
                <div className="h-px flex-1 bg-white/10" /> or <div className="h-px flex-1 bg-white/10" />
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={busy}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white/85 transition-all hover:border-[color:var(--gold)]/50 hover:bg-white/[0.08]"
              >
                <span className="auth-google-shimmer" aria-hidden />
                <GoogleIcon className="h-4 w-4" />
                <span className="relative z-10">Continue with Google</span>
              </button>

              <p className="mt-6 text-center text-[11px] uppercase tracking-[0.18em] text-white/35">
                By continuing you agree to Lan Pwint's terms
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 backdrop-blur-sm transition-transform hover:-translate-y-0.5 hover:border-[color:var(--gold)]/40">
      <div className="font-serif text-2xl text-[color:var(--gold)]">{value}</div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/55">{label}</div>
    </div>
  );
}

function RoleButton({
  active, onClick, icon: Icon, label,
}: { active: boolean; onClick: () => void; icon: typeof GraduationCap; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "group relative flex items-center gap-2 overflow-hidden rounded-xl border px-3 py-3 text-sm transition-all duration-300 " +
        (active
          ? "border-[color:var(--gold)] bg-gradient-to-br from-[color:var(--gold)]/20 to-transparent text-white shadow-[0_10px_30px_-15px_rgba(212,162,86,0.8)]"
          : "border-white/12 bg-white/[0.03] text-white/70 hover:border-white/30 hover:text-white")
      }
    >
      <span
        className={
          "grid h-7 w-7 place-items-center rounded-lg transition-colors " +
          (active ? "bg-[color:var(--gold)] text-[#0b1830]" : "bg-white/8 text-white/70 group-hover:bg-white/15")
        }
      >
        <Icon className="h-4 w-4" />
      </span>
      {label}
    </button>
  );
}

function GlowField({
  id, label, type = "text", value, onChange, required, minLength,
}: {
  id: string; label: string; type?: string; value: string; onChange: (v: string) => void;
  required?: boolean; minLength?: number;
}) {
  return (
    <div className="auth-field group space-y-1.5">
      <Label htmlFor={id} className="text-[10px] uppercase tracking-[0.2em] text-white/55">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          className="h-11 rounded-xl border-white/12 bg-white/[0.04] text-white placeholder:text-white/30 focus-visible:border-[color:var(--gold)]/60 focus-visible:ring-[color:var(--gold)]/30"
        />
        <span className="auth-field-underline" aria-hidden />
      </div>
    </div>
  );
}

function PrimaryButton({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return (
    <Button
      type="submit"
      disabled={busy}
      className="auth-primary group relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-[color:var(--gold)] via-[#f0c878] to-[color:var(--gold)] bg-[length:200%_100%] text-[#0b1830] hover:bg-[position:100%_0] hover:text-[#0b1830]"
    >
      <span className="auth-primary-shimmer" aria-hidden />
      <span className="relative z-10 flex items-center justify-center gap-2 font-medium uppercase tracking-[0.2em] text-xs">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {children}
        {!busy && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
      </span>
    </Button>
  );
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.1 4 9.3 8.5 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.2 39.5 16 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C40.9 35.8 44 30.4 44 24c0-1.2-.1-2.4-.4-3.5z" />
    </svg>
  );
}
