import { redirect } from "@tanstack/react-router";

import { loadCustomerSession } from "../services/customerSession";

export async function redirectAuthenticatedCustomer() {
  const customer = await loadCustomerSession();

  if (customer) {
    throw redirect({ to: "/dashboard" });
  }
}
