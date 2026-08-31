import { createFileRoute } from "@tanstack/react-router";

import { requireAuth } from "#/features/auth/middleware/requireAuth";
import { CustomerAccountLayout } from "#/shared/components/layout/CustomerAccountLayout";

export const Route = createFileRoute("/_protected")({
  beforeLoad: requireAuth,
  component: CustomerAccountLayout,
});
