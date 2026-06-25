import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, User as UserIcon, LayoutDashboard, Newspaper, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useUserRoles } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationsBell } from "./notifications-bell";
import { useLocale } from "@/lib/i18n";
import { useViewRole } from "@/lib/view-role";
import { RoleSwitcher } from "./role-switcher";

export function AuthMenu() {
  const { user, loading } = useSession();
  const roles = useUserRoles(user);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { t } = useLocale();
  const { viewRole } = useViewRole();

  if (loading) return null;

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/auth" search={{ as: "student" }}>
            {t("auth.studentLogin")}
          </Link>
        </Button>
        <Button asChild size="sm" className="bg-[color:var(--gold)] text-[color:var(--navy)] hover:brightness-110">
          <Link to="/auth" search={{ as: "employer" }}>
            {t("auth.employerLogin")}
          </Link>
        </Button>
      </div>
    );
  }

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const isAdmin = roles.includes("admin");
  // Admins see according to viewRole; others by their actual role
  const effectiveRole = isAdmin ? viewRole : roles.includes("employer") ? "employer" : "student";
  const showEmployer = effectiveRole === "employer";
  const initial = (user.email ?? "?").slice(0, 1).toUpperCase();

  return (
    <div className="flex items-center gap-1.5">
      {isAdmin && <RoleSwitcher user={user} />}
      <NotificationsBell userId={user.id} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--gold)] text-sm font-medium text-[color:var(--navy)] hover:brightness-110">
            {initial}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            {user.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" /> {t("auth.dashboard")}
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-[color:var(--gold)]">
                <Shield className="mr-1 inline h-3 w-3" /> {t("auth.adminPanel")}
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to="/admin/news">
                  <Newspaper className="mr-2 h-4 w-4" /> {t("auth.manageNews")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {showEmployer ? (
            <>
              <DropdownMenuItem asChild>
                <Link to="/employer/jobs">{t("auth.myJobPosts")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/employer/applications">{t("auth.applications")}</Link>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem asChild>
                <Link to="/student/jobs">{t("auth.browseJobs")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/student/applications">{t("auth.myApplications")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/student/learn">{t("auth.learning")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  <UserIcon className="mr-2 h-4 w-4" /> {t("auth.profile")}
                </Link>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={(e) => { e.preventDefault(); signOut(); }}>
            <LogOut className="mr-2 h-4 w-4" /> {t("auth.signOut")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
