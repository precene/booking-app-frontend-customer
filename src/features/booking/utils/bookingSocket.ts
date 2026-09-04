function getSocketUrl() {
  const configuredUrl = import.meta.env.VITE_SOCKET_URL as string | undefined;

  if (configuredUrl) {
    return configuredUrl;
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

  if (!apiBaseUrl) {
    return window.location.origin;
  }

  return apiBaseUrl.replace(/\/api\/v1\/?$/, "");
}

export { getSocketUrl };
