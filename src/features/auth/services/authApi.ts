import type { AuthCustomerResponse, LoginPayload, RegisterPayload } from "../types/authTypes";

import { apiClient } from "#/shared/services/apiClient";
import type { ApiResponse } from "#/shared/types";

export const authApi = {
  register: async (payload: RegisterPayload) => {
    const response = await apiClient.post<ApiResponse<AuthCustomerResponse>>(
      "/auth/register",
      payload,
    );

    return response.data;
  },

  login: async (payload: LoginPayload) => {
    const response = await apiClient.post<ApiResponse<AuthCustomerResponse>>(
      "/auth/login",
      payload,
    );

    return response.data;
  },

  me: async () => {
    const response = await apiClient.get<ApiResponse<AuthCustomerResponse>>("/auth/me");

    return response.data;
  },

  logout: async () => {
    await apiClient.post("/auth/logout");
  },
};
