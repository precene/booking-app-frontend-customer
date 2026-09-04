import { createFileRoute } from "@tanstack/react-router";

import { BookingCancelPage } from "#/features/booking/pages/BookingCancelPage";

export const Route = createFileRoute("/booking/cancel")({
  component: BookingCancelPage,
});
