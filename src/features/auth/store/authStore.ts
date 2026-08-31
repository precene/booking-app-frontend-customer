import { create } from "zustand";

import type { Customer } from "../types/authTypes";

const AUTH_CUSTOMER_STORAGE_KEY = "customer_user";

interface AuthStore {
  customer: Customer | null;
  email: string | null;
  login: (customer: Customer) => void;
  logout: () => void;
}

function getStoredCustomer() {
  if (typeof window === "undefined") {
    return null;
  }

  const customer = window.localStorage.getItem(AUTH_CUSTOMER_STORAGE_KEY);

  if (!customer) {
    return null;
  }

  try {
    return JSON.parse(customer) as Customer;
  } catch {
    window.localStorage.removeItem(AUTH_CUSTOMER_STORAGE_KEY);
    return null;
  }
}

const storedCustomer = getStoredCustomer();

export const useAuthStore = create<AuthStore>((set) => ({
  customer: storedCustomer,
  email: storedCustomer?.email ?? null,
  login: (customer) => {
    window.localStorage.setItem(AUTH_CUSTOMER_STORAGE_KEY, JSON.stringify(customer));
    set({ customer, email: customer.email });
  },
  logout: () => {
    window.localStorage.removeItem(AUTH_CUSTOMER_STORAGE_KEY);
    set({ customer: null, email: null });
  },
}));
