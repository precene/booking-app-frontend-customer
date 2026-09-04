import { createFileRoute } from "@tanstack/react-router";

import { BookingSuccessPage } from "#/features/booking/pages/BookingSuccessPage";

export const Route = createFileRoute("/booking/success")({
  component: BookingSuccessPage,
});
