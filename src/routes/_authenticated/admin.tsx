import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleGuard } from "@/lib/role-guard";
import { RoleLayout } from "@/components/role-shell";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <RoleGuard required="admin">
      <RoleLayout role="admin">
        <Outlet />
      </RoleLayout>
    </RoleGuard>
  );
}
