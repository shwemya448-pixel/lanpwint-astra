import { createContext, useContext, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Briefcase,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquare,
  Newspaper,
  Plus,
  Shield,
  Sparkles,
  User,
  Users,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { cn } from "@/lib/utils";

/** When set, `PageShell` skips the marketing SiteHeader so the role nav owns the top bar. */
export const RoleShellContext = createContext<AppRole | null>(null);
export function useRoleShell() {
  return useContext(RoleShellContext);
}

type NavItem = { to: string; label: string; icon: any; params?: Record<string, string> };

const STUDENT_NAV: NavItem[] = [
  { to: "/student/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/student/jobs", label: "Browse jobs", icon: Briefcase },
  { to: "/student/applications", label: "Applications", icon: FileText },
  { to: "/student/learn", label: "Learn", icon: BookOpen },
  { to: "/student/job-map", label: "Job map", icon: MapPin },
  { to: "/student/cv-analyzer", label: "CV Analyzer", icon: Sparkles },
  { to: "/student/my-cv", label: "My CV", icon: User },
  { to: "/student/messages", label: "Messages", icon: MessageSquare },
];

const EMPLOYER_NAV: NavItem[] = [
  { to: "/employer/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/employer/jobs/new", label: "Post job", icon: Plus },
  { to: "/employer/jobs", label: "My jobs", icon: Briefcase },
  { to: "/employer/job-map", label: "Job map", icon: MapPin },
  { to: "/employer/cv-board", label: "CV Board", icon: Users },
  { to: "/employer/applications", label: "Applications", icon: FileText },
  { to: "/employer/messages", label: "Messages", icon: MessageSquare },
];

const ADMIN_NAV: NavItem[] = [
  { to: "/admin/dashboard", label: "Admin", icon: Shield },
  { to: "/admin/news", label: "News", icon: Newspaper },
];

const NAV_BY_ROLE: Record<AppRole, NavItem[]> = {
  student: STUDENT_NAV,
  employer: EMPLOYER_NAV,
  admin: ADMIN_NAV,
};

const ROLE_LABEL: Record<AppRole, string> = {
  student: "Student workspace",
  employer: "Employer workspace",
  admin: "Admin workspace",
};

const ROLE_TINT: Record<AppRole, string> = {
  student: "from-teal/15 to-transparent",
  employer: "from-[color:var(--gold)]/15 to-transparent",
  admin: "from-[color:var(--gold)]/30 to-transparent",
};

export function RoleLayout({ role, children }: { role: AppRole; children: ReactNode }) {
  return (
    <RoleShellContext.Provider value={role}>
      <div className="flex min-h-screen flex-col bg-background">
        <RoleNav role={role} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </RoleShellContext.Provider>
  );
}

export function RoleNav({ role }: { role: AppRole }) {
  const items = NAV_BY_ROLE[role];
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className={cn("sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md")}>
      <div className={cn("bg-gradient-to-b", ROLE_TINT[role])}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[color:var(--gold)] text-[color:var(--navy)] font-serif text-lg leading-none">
              L
            </span>
            <div className="leading-tight">
              <div className="font-serif text-base text-foreground">Lan Pwint</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--gold)]/85">
                {ROLE_LABEL[role]}
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            <LanguageToggle />
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="mr-1.5 h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6 lg:px-8">
          {items.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-navy text-navy-foreground"
                    : "text-foreground/75 hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-3.5 w-3.5" /> {item.label}
              </Link>
            );
          })}
          <div className="ml-auto flex items-center gap-2 lg:hidden">
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
