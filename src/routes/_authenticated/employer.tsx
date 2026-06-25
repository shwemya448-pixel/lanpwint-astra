import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleGuard } from "@/lib/role-guard";
import { RoleLayout } from "@/components/role-shell";

export const Route = createFileRoute("/_authenticated/employer")({
  component: EmployerLayout,
});

function EmployerLayout() {
  return (
    <RoleGuard required="employer">
      <RoleLayout role="employer">
        <Outlet />
      </RoleLayout>
    </RoleGuard>
  );
}
