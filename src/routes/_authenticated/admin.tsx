import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleGuard } from "@/lib/role-guard";
import { AdminShell } from "@/components/admin/admin-shell";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <RoleGuard required="admin">
      <AdminShell>
        <Outlet />
      </AdminShell>
    </RoleGuard>
  );
}
