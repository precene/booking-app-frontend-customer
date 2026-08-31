import { createFileRoute } from "@tanstack/react-router";

import { MyBookingsPage } from "#/features/booking/pages/MyBookingsPage";

export const Route = createFileRoute("/_protected/my-bookings")({
  component: MyBookingsPage,
});
