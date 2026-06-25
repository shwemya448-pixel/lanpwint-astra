import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  DollarSign,
  FileText,
  GraduationCap,
  Newspaper,
  Shield,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { supabase } from "@/integrations/supabase/client";
import { useViewRole } from "@/lib/view-role";
import type { AppRole } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Lan Pwint" }] }),
  component: AdminDashboard,
});


type Insights = {
  totalUsers: number;
  roleCounts: { student: number; employer: number; admin: number };
  totalJobs: number;
  totalApplications: number;
  totalNews: number;
  signupsLast30d: number;
  signupsPrev30d: number;
  growthPct: number;
  signupSeries: { date: string; signups: number }[];
  topLocations: { name: string; users: number }[];
};

function AdminDashboard() {
  const { viewRole, setViewRole } = useViewRole();
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-insights"],
    queryFn: fetchInsights,
    staleTime: 60_000,
  });

  function onPickRole(r: AppRole) {
    setViewRole(r);
    if (r === "student") navigate({ to: "/student/dashboard" });
    else if (r === "employer") navigate({ to: "/employer/dashboard" });
  }

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* ambient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-10 h-72 bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--gold)_18%,transparent),transparent_70%)]" />

      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--gold)]/30 bg-[color:var(--gold)]/10 px-3 py-1 text-[color:var(--gold)]">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em]">Insights</span>
          </div>
          <h1 className="mt-3 font-serif text-4xl text-navy sm:text-5xl">Lan Pwint</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            A live snapshot of who's using the platform, what they're doing, and where it's growing.
          </p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card/60 p-1 shadow-sm backdrop-blur">
          <span className="px-3 text-[11px] uppercase tracking-wider text-muted-foreground">View as</span>
          {(["admin", "student", "employer"] as AppRole[]).map((r) => {
            const active = viewRole === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => onPickRole(r)}
                className={
                  "rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-all " +
                  (active
                    ? "bg-gradient-to-r from-navy to-deep text-navy-foreground shadow-md shadow-navy/30"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground")
                }
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>


      {error ? (
        <ErrorBox message={(error as Error).message} />
      ) : isLoading || !data ? (
        <SkeletonRow />
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              tint="bg-gradient-to-br from-[#ff8a65] to-[#ff6e7f]"
              icon={Users}
              label="Total users"
              value={data.totalUsers.toLocaleString()}
              sub={`${data.signupsLast30d} new in 30d`}
            />
            <StatTile
              tint="bg-gradient-to-br from-[#43cea2] to-[#185a9d]"
              icon={TrendingUp}
              label="30-day growth"
              value={`${data.growthPct >= 0 ? "+" : ""}${data.growthPct.toFixed(1)}%`}
              sub={`vs prior 30d (${data.signupsPrev30d})`}
            />
            <StatTile
              tint="bg-gradient-to-br from-[#ee0979] to-[#ff6a00]"
              icon={Briefcase}
              label="Jobs posted"
              value={data.totalJobs.toLocaleString()}
              sub={`${data.totalApplications} applications`}
            />
            <StatTile
              tint="bg-gradient-to-br from-[#36d1dc] to-[#5b86e5]"
              icon={DollarSign}
              label="Revenue (MMK)"
              value="0"
              sub="Connect payments to track"
            />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-lg text-navy">Signups — last 30 days</h2>
                  <p className="text-xs text-muted-foreground">Daily new profiles</p>
                </div>
              </div>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.signupSeries}>
                    <defs>
                      <linearGradient id="signups" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--navy)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--navy)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="signups"
                      stroke="var(--navy)"
                      strokeWidth={2}
                      fill="url(#signups)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-serif text-lg text-navy">User mix</h2>
              <p className="text-xs text-muted-foreground">By role</p>
              <div className="mt-3 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleSlices(data.roleCounts)}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={48}
                      outerRadius={78}
                      paddingAngle={2}
                    >
                      {roleSlices(data.roleCounts).map((s, i) => (
                        <Cell key={i} fill={s.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 space-y-1.5 text-sm">
                {roleSlices(data.roleCounts).map((s) => {
                  const total = Math.max(1, data.totalUsers);
                  const pct = ((s.value / total) * 100).toFixed(1);
                  return (
                    <li key={s.name} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                        <span className="capitalize">{s.name}</span>
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {s.value} · {pct}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-serif text-lg text-navy">Top locations</h2>
              <p className="text-xs text-muted-foreground">Where your users are based</p>
              <div className="mt-3 h-64">
                {data.topLocations.length === 0 ? (
                  <EmptyChart label="No location data yet — users haven't filled in their profiles." />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.topLocations} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                        }}
                      />
                      <Bar dataKey="users" fill="var(--gold)" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-serif text-lg text-navy">Platform activity</h2>
              <p className="text-xs text-muted-foreground">Counts across the workspace</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-2">
                <MiniStat icon={GraduationCap} label="Students" value={data.roleCounts.student} />
                <MiniStat icon={UserCheck} label="Employers" value={data.roleCounts.employer} />
                <MiniStat icon={Briefcase} label="Open jobs" value={data.totalJobs} />
                <MiniStat icon={FileText} label="Applications" value={data.totalApplications} />
                <MiniStat icon={Newspaper} label="News posts" value={data.totalNews} />
                <MiniStat icon={Shield} label="Admins" value={data.roleCounts.admin} />
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function StatTile({
  tint,
  icon: Icon,
  label,
  value,
  sub,
}: {
  tint: string;
  icon: any;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className={`rounded-2xl p-5 text-white shadow-md ${tint}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-2xl font-semibold">{value}</div>
          <div className="mt-0.5 text-sm opacity-90">{label}</div>
        </div>
        <Icon className="h-7 w-7 opacity-80" />
      </div>
      <div className="mt-4 rounded-md bg-white/20 px-2 py-1 text-[11px]">{sub}</div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-[color:var(--gold)]/15 text-[color:var(--gold)]">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <div className="text-lg font-semibold text-navy">{value.toLocaleString()}</div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
      Insights could not load: {message}
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="grid h-full place-items-center text-center text-xs text-muted-foreground">
      {label}
    </div>
  );
}

function roleSlices(rc: Insights["roleCounts"]) {
  return [
    { name: "students", value: rc.student, color: "#36d1dc" },
    { name: "employers", value: rc.employer, color: "#ff8a65" },
    { name: "admins", value: rc.admin, color: "var(--gold)" },
  ];
}

async function fetchInsights(): Promise<Insights> {
  const since30 = new Date(Date.now() - 30 * 86400_000).toISOString();
  const sincePrev = new Date(Date.now() - 60 * 86400_000).toISOString();

  const [profilesRes, rolesRes, jobsRes, appsRes, newsRes] = await Promise.all([
    supabase.from("profiles").select("id, created_at, location"),
    supabase.from("user_roles").select("user_id, role"),
    supabase.from("jobs").select("id", { count: "exact", head: true }),
    supabase.from("applications").select("id", { count: "exact", head: true }),
    supabase.from("news_posts").select("id", { count: "exact", head: true }),
  ]);

  if (profilesRes.error) throw profilesRes.error;
  if (rolesRes.error) throw rolesRes.error;

  const profiles = profilesRes.data ?? [];
  const totalUsers = profiles.length;

  const rc = { student: 0, employer: 0, admin: 0 } as Insights["roleCounts"];
  for (const r of rolesRes.data ?? []) {
    const role = r.role as keyof typeof rc;
    if (rc[role] !== undefined) rc[role]++;
  }

  // Signups series — last 30 days
  const buckets = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400_000);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  let signupsLast30d = 0;
  let signupsPrev30d = 0;
  for (const p of profiles) {
    if (!p.created_at) continue;
    const t = new Date(p.created_at).getTime();
    if (t >= Date.parse(since30)) {
      signupsLast30d++;
      const day = new Date(p.created_at).toISOString().slice(0, 10);
      if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + 1);
    } else if (t >= Date.parse(sincePrev)) {
      signupsPrev30d++;
    }
  }
  const signupSeries = [...buckets.entries()].map(([date, signups]) => ({
    date: date.slice(5),
    signups,
  }));
  const growthPct = signupsPrev30d === 0
    ? signupsLast30d > 0 ? 100 : 0
    : ((signupsLast30d - signupsPrev30d) / signupsPrev30d) * 100;

  // Locations
  const locCounts = new Map<string, number>();
  for (const p of profiles) {
    const loc = (p.location ?? "").trim();
    if (!loc) continue;
    const key = loc.split(",")[0].trim();
    locCounts.set(key, (locCounts.get(key) ?? 0) + 1);
  }
  const topLocations = [...locCounts.entries()]
    .map(([name, users]) => ({ name, users }))
    .sort((a, b) => b.users - a.users)
    .slice(0, 6);

  return {
    totalUsers,
    roleCounts: rc,
    totalJobs: jobsRes.count ?? 0,
    totalApplications: appsRes.count ?? 0,
    totalNews: newsRes.count ?? 0,
    signupsLast30d,
    signupsPrev30d,
    growthPct,
    signupSeries,
    topLocations,
  };
}
