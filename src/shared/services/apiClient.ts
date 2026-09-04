import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";

import { useAuthStore } from "#/features/auth/store/authStore";

declare module "axios" {
  interface AxiosRequestConfig {
    skipAuthRedirect?: boolean;
  }
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

function getCurrentRedirectTarget() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function getLoginHref() {
  const redirectTo = getCurrentRedirectTarget();

  return `/login?redirectTo=${encodeURIComponent(redirectTo)}`;
}

function isSessionCheckRequest(url: string | undefined) {
  return url === "/auth/me";
}

function shouldSkipAuthRedirect(config: InternalAxiosRequestConfig | undefined) {
  return Boolean(config?.skipAuthRedirect);
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();

      if (
        !isSessionCheckRequest(error.config?.url) &&
        !shouldSkipAuthRedirect(error.config) &&
        !["/", "/login", "/register"].includes(window.location.pathname)
      ) {
        window.location.href = getLoginHref();
      }
    }

    return Promise.reject(error);
  },
);
