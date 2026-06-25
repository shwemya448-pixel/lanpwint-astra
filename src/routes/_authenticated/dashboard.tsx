import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useSession } from "@/lib/auth";
import { useViewRole } from "@/lib/view-role";
import { useUserRolesQuery } from "@/lib/role-guard";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Lan Pwint" }] }),
  component: DashboardRouter,
});

/**
 * `/dashboard` is a router only. It inspects the user's roles and redirects to
 * the correct role-specific dashboard. Real UI lives under
 * `/student/dashboard`, `/employer/dashboard`, and `/admin/dashboard`.
 */
function DashboardRouter() {
  const { user, loading } = useSession();
  const { data: roles, isLoading } = useUserRolesQuery();
  const { viewRole } = useViewRole();

  if (loading || (user && isLoading)) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Loading your workspace…
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" />;

  const list = roles ?? [];
  if (list.includes("admin")) {
    if (viewRole === "student") return <Navigate to="/student/dashboard" />;
    if (viewRole === "employer") return <Navigate to="/employer/dashboard" />;
    return <Navigate to="/admin/dashboard" />;
  }
  if (list.includes("employer")) return <Navigate to="/employer/dashboard" />;
  if (list.includes("student")) return <Navigate to="/student/dashboard" />;
  return <Navigate to="/unauthorized" />;
}
