import { createFileRoute } from "@tanstack/react-router";

import { MyPaymentsPage } from "#/features/payments/pages/MyPaymentsPage";

export const Route = createFileRoute("/_protected/my-payments")({
  component: MyPaymentsPage,
});
