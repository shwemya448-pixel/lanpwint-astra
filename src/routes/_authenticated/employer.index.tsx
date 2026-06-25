import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/employer/")({
  component: () => <Navigate to="/employer/dashboard" />,
});
