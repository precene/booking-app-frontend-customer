import { redirect } from "@tanstack/react-router";

import { useAuthStore } from "../store/authStore";

export function requireAuth() {
  if (!useAuthStore.getState().customer) {
    throw redirect({ to: "/login" });
  }
}
