import { createFileRoute } from "@tanstack/react-router";

import { LoginPage } from "#/features/auth/pages/LoginPage";

export const Route = createFileRoute("/_public/login")({
  component: LoginPage,
  validateSearch: (search): { redirectTo?: string } => {
    const redirectTo = search.redirectTo;

    if (typeof redirectTo !== "string") {
      return {};
    }

    if (!redirectTo.startsWith("/") || redirectTo.startsWith("//") || redirectTo === "/login") {
      return {};
    }

    return { redirectTo };
  },
});
