import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/student/")({
  component: () => <Navigate to="/student/dashboard" />,
});
