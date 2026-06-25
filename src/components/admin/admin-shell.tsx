import type { ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  FileText,
  LayoutDashboard,
  LogOut,
  Newspaper,
  PlayCircle,
  Plus,
  Shield,
  Users,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { RoleShellContext } from "@/components/role-shell";
import { cn } from "@/lib/utils";

type Item = { to: string; label: string; icon: any };

const NAV: { group: string; items: Item[] }[] = [
  {
    group: "Overview",
    items: [
      { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/users", label: "Users", icon: Users },
    ],
  },
  {
    group: "Jobs",
    items: [
      { to: "/admin/jobs", label: "All jobs", icon: Briefcase },
      { to: "/admin/jobs/new", label: "Post a job", icon: Plus },
      { to: "/admin/applications", label: "Applications", icon: FileText },
    ],
  },
  {
    group: "Content",
    items: [
      { to: "/admin/news", label: "News editor", icon: Newspaper },
      { to: "/admin/learn", label: "Learn videos", icon: PlayCircle },
    ],
  },
];

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <RoleShellContext.Provider value="admin">
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AdminSidebar />
          <div className="flex flex-1 flex-col">
            <AdminTopbar />
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </RoleShellContext.Provider>
  );
}

function AdminSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border">
        <Link to="/admin/dashboard" className="flex items-center gap-2.5 px-2 py-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[color:var(--gold)] text-[color:var(--navy)] font-serif text-lg leading-none">
            L
          </span>
          <div className="leading-tight group-data-[collapsible=icon]:hidden">
            <div className="font-serif text-base text-foreground">Lan Pwint</div>
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--gold)]/85">
              <Shield className="h-3 w-3" /> Admin
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {NAV.map((section) => (
          <SidebarGroup key={section.group}>
            <SidebarGroupLabel>{section.group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={isActive(item.to)}>
                      <Link to={item.to} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

function AdminTopbar() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md",
      )}
    >
      <SidebarTrigger />
      <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--gold)]">
        Admin workspace
      </div>
      <div className="ml-auto flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
        <Button variant="outline" size="sm" onClick={signOut}>
          <LogOut className="mr-1.5 h-4 w-4" /> Sign out
        </Button>
      </div>
    </header>
  );
}
