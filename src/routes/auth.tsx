import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Briefcase, GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: name, role },
          },
        });
        if (error) throw error;
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
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* Left: brand */}
      <div className="relative hidden bg-gradient-to-br from-navy via-deep to-teal p-12 text-navy-foreground lg:flex lg:flex-col lg:justify-between grain">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-mist text-navy font-serif text-lg">L</span>
          <div className="leading-tight">
            <div className="font-serif text-base">Lan Pwint</div>
            <div className="text-[10px] uppercase tracking-[0.18em] opacity-80">လမ်းပွင့်</div>
          </div>
        </Link>
        <div>
          <p className="text-xs uppercase tracking-[0.22em] opacity-80">The road opens here</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
            Build a career through learning, internships, and employment.
          </h1>
          <p className="mt-5 max-w-md opacity-85">
            Join thousands of students, graduates, and employers shaping their next chapter together.
          </p>
        </div>
        <div className="text-xs opacity-70">© {new Date().getFullYear()} Lan Pwint</div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back home</Link>
          <h2 className="mt-4 font-serif text-3xl text-navy">Welcome to Lan Pwint</h2>
          <p className="mt-2 text-sm text-muted-foreground">Sign in or create an account to continue.</p>

          {/* Role */}
          <div className="mt-6">
            <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">I am a</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <RoleButton active={role === "student"} onClick={() => setRole("student")} icon={GraduationCap} label="Candidate" />
              <RoleButton active={role === "employer"} onClick={() => setRole("employer")} icon={Briefcase} label="Employer" />
            </div>
          </div>

          {/* Mode tabs */}
          <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")} className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-5">
              <form onSubmit={handleEmail} className="space-y-4">
                <Field id="email1" label="Email" type="email" value={email} onChange={setEmail} required />
                <Field id="pw1" label="Password" type="password" value={password} onChange={setPassword} required />
                <Button type="submit" disabled={busy} className="w-full bg-navy text-navy-foreground hover:bg-deep">
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-5">
              <form onSubmit={handleEmail} className="space-y-4">
                <Field id="name" label="Full name" value={name} onChange={setName} required />
                <Field id="email2" label="Email" type="email" value={email} onChange={setEmail} required />
                {role === "employer" && (
                  <>
                    <Field
                      id="company"
                      label="Company name"
                      value={companyName}
                      onChange={setCompanyName}
                      required
                    />
                    <Field
                      id="position"
                      label="Your position"
                      value={position}
                      onChange={setPosition}
                      required
                    />
                  </>
                )}
                <Field id="pw2" label="Password" type="password" value={password} onChange={setPassword} required minLength={6} />
                <Button type="submit" disabled={busy} className="w-full bg-navy text-navy-foreground hover:bg-deep">
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <Button type="button" variant="outline" onClick={handleGoogle} disabled={busy} className="w-full">
            <GoogleIcon className="mr-2 h-4 w-4" /> Continue with Google
          </Button>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to Lan Pwint's terms of service.
          </p>
        </div>
      </div>
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
        "flex items-center gap-2 rounded-lg border p-3 text-sm transition-all " +
        (active
          ? "border-navy bg-navy text-navy-foreground"
          : "border-border bg-card hover:border-teal")
      }
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

function Field({
  id, label, type = "text", value, onChange, required, minLength,
}: {
  id: string; label: string; type?: string; value: string; onChange: (v: string) => void;
  required?: boolean; minLength?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} minLength={minLength} />
    </div>
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
