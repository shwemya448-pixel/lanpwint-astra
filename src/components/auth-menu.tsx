import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";
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

export function AuthMenu() {
  const { user, loading } = useSession();
  const roles = useUserRoles(user);
  const navigate = useNavigate();
  const qc = useQueryClient();

  if (loading) return null;

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/auth" search={{ as: "student" }}>
            Student Login
          </Link>
        </Button>
        <Button asChild size="sm" className="bg-navy text-navy-foreground hover:bg-deep">
          <Link to="/auth" search={{ as: "employer" }}>
            Employer Login
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

  const isEmployer = roles.includes("employer");
  const initial = (user.email ?? "?").slice(0, 1).toUpperCase();

  return (
    <div className="flex items-center gap-1">
      <NotificationsBell userId={user.id} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-navy text-sm font-medium text-navy-foreground hover:bg-deep">
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
              <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
            </Link>
          </DropdownMenuItem>
          {isEmployer ? (
            <>
              <DropdownMenuItem asChild>
                <Link to="/employer/jobs">My job posts</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/employer/applications">Applications</Link>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem asChild>
                <Link to="/jobs">Browse jobs</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/applications">My applications</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/lessons">Learning</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  <UserIcon className="mr-2 h-4 w-4" /> My profile
                </Link>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={(e) => { e.preventDefault(); signOut(); }}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
