import type { ApiResponse } from "#/shared/types";

import { getSocketUrl } from "../utils/bookingSocket";

export const deviceTokenApi = {
  getDeviceToken: async () => {
    const response = await fetch(`${getSocketUrl()}/device-token`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Unable to create anonymous booking session.");
    }

    const body = (await response.json()) as ApiResponse<{ deviceToken: string }>;

    return body.data.deviceToken;
  },
};
