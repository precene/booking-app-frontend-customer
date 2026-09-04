import { createFileRoute } from "@tanstack/react-router";

import { VerifyEmailPage } from "#/features/settings/pages/VerifyEmailPage";

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmailPage,
  validateSearch: (search): { token?: string } => {
    const token = search.token;

    if (typeof token !== "string" || !token.trim()) {
      return {};
    }

    return { token };
  },
});
