import { useQuery } from "@tanstack/react-query";
import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import { useSession, type AppRole } from "@/lib/auth";
import { useViewRole } from "@/lib/view-role";

export function useUserRolesQuery() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["user_roles", user?.id],
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async (): Promise<AppRole[]> => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      return (data ?? []).map((r) => r.role as AppRole);
    },
  });
}

/**
 * Strict role gate. Renders children only if the signed-in user holds `required`
 * OR is an admin previewing as that role. Otherwise renders <Navigate /> to
 * /unauthorized (or /auth when signed out).
 */
export function RoleGuard({
  required,
  children,
}: {
  required: AppRole;
  children: ReactNode;
}) {
  const { user, loading } = useSession();
  const { data: roles, isLoading: rolesLoading } = useUserRolesQuery();
  const { viewRole } = useViewRole();

  if (loading || (user && rolesLoading)) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Checking access…
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" />;

  const list = roles ?? [];
  const isAdmin = list.includes("admin");

  // Admin has full access to every role's workspace, regardless of preview selection.
  if (isAdmin) return <>{children}</>;

  // Non-admin: if the user actually holds the role, allow.
  if (list.includes(required)) {
    // Respect the view-role preview only when the user holds multiple roles.
    if (list.length > 1 && viewRole && viewRole !== required) {
      return <Navigate to="/unauthorized" />;
    }
    return <>{children}</>;
  }

  return <Navigate to="/unauthorized" />;
}
