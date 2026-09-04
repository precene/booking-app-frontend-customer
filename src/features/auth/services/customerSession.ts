import { isAxiosError } from "axios";

import { authApi } from "./authApi";
import { useAuthStore } from "../store/authStore";
import type { Customer } from "../types/authTypes";

let sessionRequest: null | Promise<Customer | null> = null;

type LoadCustomerSessionOptions = {
  throwOnError?: boolean;
};

export async function loadCustomerSession(options: LoadCustomerSessionOptions = {}) {
  const { customer, hasCheckedSession } = useAuthStore.getState();

  if (customer) {
    return customer;
  }

  if (hasCheckedSession) {
    return null;
  }

  sessionRequest ??= fetchCustomerSession(options);

  try {
    return await sessionRequest;
  } finally {
    sessionRequest = null;
  }
}

async function fetchCustomerSession({ throwOnError = false }: LoadCustomerSessionOptions) {
  useAuthStore.getState().setSessionLoading(true);

  try {
    const response = await authApi.me();
    const customer = response.data.user;

    if (customer.role !== "customer") {
      await authApi.logout().catch(() => undefined);
      useAuthStore.getState().setCustomer(null);
      return null;
    }

    useAuthStore.getState().setCustomer(customer);
    return customer;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) {
      useAuthStore.getState().setCustomer(null);
      return null;
    }

    useAuthStore.getState().resetSessionCheck();

    if (throwOnError) {
      throw error;
    }

    return null;
  }
}
