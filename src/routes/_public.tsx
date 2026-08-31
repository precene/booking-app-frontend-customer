import { Outlet, createFileRoute } from "@tanstack/react-router";

import { redirectAuthenticatedCustomer } from "#/features/auth/middleware/redirectAuthenticatedCustomer";

export const Route = createFileRoute("/_public")({
  beforeLoad: redirectAuthenticatedCustomer,
  component: Outlet,
});
