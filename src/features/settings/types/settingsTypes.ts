export type CustomerProfile = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  cityId: string | null;
  cityName: string | null;
  role: "admin" | "customer" | "staff";
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfilePayload = {
  cityId?: string | null;
  fullName?: string;
  phone?: string | null;
};

export type SettingsCity = {
  active: boolean;
  createdAt: string;
  id: string;
  name: string;
  slug: string;
  timezone: string;
  updatedAt: string;
};

export type RequestEmailChangePayload = {
  newEmail: string;
};

export type VerifyEmailChangePayload = {
  token: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type NotificationType =
  | "booking_confirmed"
  | "booking_cancelled"
  | "refund_requested"
  | "refund_approved"
  | "refund_rejected"
  | "promotional"
  | "security";

export type NotificationPreference = {
  notificationType: NotificationType;
  enabled: boolean;
};

export type PaymentMethod = {
  id: string;
  cardBrand: string;
  cardLast4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  createdAt: string;
};
