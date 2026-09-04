import { apiClient } from "#/shared/services/apiClient";
import type { ApiResponse } from "#/shared/types";

import type {
  ChangePasswordPayload,
  CustomerProfile,
  NotificationPreference,
  NotificationType,
  PaymentMethod,
  RequestEmailChangePayload,
  SettingsCity,
  UpdateProfilePayload,
  VerifyEmailChangePayload,
} from "../types/settingsTypes";

export const settingsApi = {
  getProfile: async () => {
    const response = await apiClient.get<ApiResponse<{ profile: CustomerProfile }>>("/me/profile");

    return response.data.data.profile;
  },

  updateProfile: async (payload: UpdateProfilePayload) => {
    const response = await apiClient.put<ApiResponse<{ profile: CustomerProfile }>>(
      "/me/profile",
      payload,
    );

    return response.data.data.profile;
  },

  listCities: async () => {
    const response = await apiClient.get<ApiResponse<{ cities: SettingsCity[] }>>("/cities");

    return response.data.data.cities ?? [];
  },

  requestEmailChange: async (payload: RequestEmailChangePayload) => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      "/me/change-email",
      payload,
    );

    return response.data.data;
  },

  verifyEmailChange: async (payload: VerifyEmailChangePayload) => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      "/verify-email",
      payload,
    );

    return response.data.data;
  },

  changePassword: async (payload: ChangePasswordPayload) => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      "/me/change-password",
      payload,
    );

    return response.data.data;
  },

  getNotificationPreferences: async () => {
    const response = await apiClient.get<ApiResponse<{ preferences: NotificationPreference[] }>>(
      "/me/notification-preferences",
    );

    return response.data.data.preferences;
  },

  updateNotificationPreference: async (payload: {
    notificationType: NotificationType;
    enabled: boolean;
  }) => {
    const response = await apiClient.put<ApiResponse<NotificationPreference>>(
      "/me/notification-preferences",
      payload,
    );

    return response.data.data;
  },

  bulkUpdateNotificationPreferences: async (payload: {
    preferences: Array<{ notificationType: NotificationType; enabled: boolean }>;
  }) => {
    const response = await apiClient.put<ApiResponse<{ preferences: NotificationPreference[] }>>(
      "/me/notification-preferences/bulk",
      payload,
    );

    return response.data.data.preferences;
  },

  listPaymentMethods: async () => {
    const response =
      await apiClient.get<ApiResponse<{ paymentMethods: PaymentMethod[] }>>("/me/payment-methods");

    return response.data.data.paymentMethods;
  },

  addPaymentMethod: async (payload: { paymentMethodId: string }) => {
    const response = await apiClient.post<ApiResponse<{ paymentMethod: PaymentMethod }>>(
      "/me/payment-methods",
      payload,
    );

    return response.data.data.paymentMethod;
  },

  removePaymentMethod: async (paymentMethodId: string) => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/me/payment-methods/${paymentMethodId}`,
    );

    return response.data.data;
  },
};
