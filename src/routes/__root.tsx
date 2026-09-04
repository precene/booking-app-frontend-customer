import { createRootRoute } from "@tanstack/react-router";

import { CustomerLayout } from "#/shared/components/layout/CustomerLayout";
import { Toaster } from "#/shared/components/ui/toast";

import "../styles.css";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <CustomerLayout />
      <Toaster />
    </>
  );
}
