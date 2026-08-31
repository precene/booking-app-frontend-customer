import { redirect } from "@tanstack/react-router";

import { useAuthStore } from "../store/authStore";

export function redirectAuthenticatedCustomer() {
  if (useAuthStore.getState().customer) {
    throw redirect({ to: "/dashboard" });
  }
}
