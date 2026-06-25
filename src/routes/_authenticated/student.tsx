import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleGuard } from "@/lib/role-guard";
import { RoleLayout } from "@/components/role-shell";

export const Route = createFileRoute("/_authenticated/student")({
  component: StudentLayout,
});

function StudentLayout() {
  return (
    <RoleGuard required="student">
      <RoleLayout role="student">
        <Outlet />
      </RoleLayout>
    </RoleGuard>
  );
}
