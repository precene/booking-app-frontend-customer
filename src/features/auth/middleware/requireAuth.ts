import { redirect } from "@tanstack/react-router";

import { loadCustomerSession } from "../services/customerSession";

function getRedirectTarget(href: string) {
  if (href.startsWith("/")) {
    return href;
  }

  try {
    const url = new URL(href);

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/dashboard";
  }
}

function getLoginRedirectHref(href: string) {
  return `/login?redirectTo=${encodeURIComponent(getRedirectTarget(href))}`;
}

export async function requireAuth({ location }: { location: { href: string } }) {
  const customer = await loadCustomerSession({ throwOnError: true });

  if (!customer) {
    throw redirect({
      href: getLoginRedirectHref(location.href),
    });
  }
}
