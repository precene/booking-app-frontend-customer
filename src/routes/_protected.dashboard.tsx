import { createFileRoute } from "@tanstack/react-router";

import { DashboardPage } from "#/features/customer-dashboard/pages/DashboardPage";

export const Route = createFileRoute("/_protected/dashboard")({
  component: DashboardPage,
});
