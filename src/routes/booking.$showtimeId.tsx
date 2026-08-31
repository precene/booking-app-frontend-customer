import { createFileRoute } from "@tanstack/react-router";

import { SeatSelectionPage } from "#/features/booking/pages/SeatSelectionPage";

export const Route = createFileRoute("/booking/$showtimeId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { showtimeId } = Route.useParams();

  return <SeatSelectionPage showtimeId={showtimeId} />;
}
