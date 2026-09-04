import { create } from "zustand";

import type { Customer } from "#/features/auth/types/authTypes";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";

import { settingsApi } from "../services/settingsApi";
import type {
  CustomerProfile,
  NotificationPreference,
  PaymentMethod,
  SettingsCity,
} from "../types/settingsTypes";

type SettingsStore = {
  cities: SettingsCity[];
  errorMessage: string | null;
  isLoadingSettings: boolean;
  notificationPreferences: NotificationPreference[];
  paymentMethods: PaymentMethod[];
  profile: CustomerProfile | null;
  loadSettings: (updateCustomer: (customer: Partial<Customer>) => void) => Promise<void>;
  setNotificationPreferences: (preferences: NotificationPreference[]) => void;
  setPaymentMethods: (paymentMethods: PaymentMethod[]) => void;
  setProfile: (
    profile: CustomerProfile,
    updateCustomer?: (customer: Partial<Customer>) => void,
  ) => void;
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  cities: [],
  errorMessage: null,
  isLoadingSettings: true,
  notificationPreferences: [],
  paymentMethods: [],
  profile: null,

  loadSettings: async (updateCustomer) => {
    set({ errorMessage: null, isLoadingSettings: true });

    try {
      const [profile, cities, notificationPreferences, paymentMethods] = await Promise.all([
        settingsApi.getProfile(),
        settingsApi.listCities(),
        settingsApi.getNotificationPreferences(),
        settingsApi.listPaymentMethods(),
      ]);

      updateCustomer(profile);
      set({
        cities: cities.filter((city) => city.active),
        errorMessage: null,
        isLoadingSettings: false,
        notificationPreferences,
        paymentMethods,
        profile,
      });
    } catch (error) {
      set({
        errorMessage: getApiErrorMessage(error, "Unable to load account settings."),
        isLoadingSettings: false,
      });
    }
  },

  setNotificationPreferences: (notificationPreferences) => {
    set({ notificationPreferences });
  },

  setPaymentMethods: (paymentMethods) => {
    set({ paymentMethods });
  },

  setProfile: (profile, updateCustomer) => {
    updateCustomer?.(profile);
    set({ profile });
  },
}));
