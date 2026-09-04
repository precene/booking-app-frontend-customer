import { create } from "zustand";

import type { Customer } from "../types/authTypes";

interface AuthStore {
  customer: Customer | null;
  email: string | null;
  hasCheckedSession: boolean;
  isLoadingCustomer: boolean;
  login: (customer: Customer) => void;
  logout: () => void;
  resetSessionCheck: () => void;
  setCustomer: (customer: Customer | null) => void;
  setSessionLoading: (isLoadingCustomer: boolean) => void;
  updateCustomer: (customer: Partial<Customer>) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  customer: null,
  email: null,
  hasCheckedSession: false,
  isLoadingCustomer: false,

  login: (customer) => {
    set({
      customer,
      email: customer.email,
      hasCheckedSession: true,
      isLoadingCustomer: false,
    });
  },

  logout: () => {
    set({
      customer: null,
      email: null,
      hasCheckedSession: true,
      isLoadingCustomer: false,
    });
  },

  resetSessionCheck: () => {
    set({
      customer: null,
      email: null,
      hasCheckedSession: false,
      isLoadingCustomer: false,
    });
  },

  setCustomer: (customer) => {
    set({
      customer,
      email: customer?.email ?? null,
      hasCheckedSession: true,
      isLoadingCustomer: false,
    });
  },

  setSessionLoading: (isLoadingCustomer) => {
    set({ isLoadingCustomer });
  },

  updateCustomer: (customer) => {
    set((state) => {
      if (!state.customer) {
        return state;
      }

      const updatedCustomer = { ...state.customer, ...customer };

      return { customer: updatedCustomer, email: updatedCustomer.email };
    });
  },
}));
