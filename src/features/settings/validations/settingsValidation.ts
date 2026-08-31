import { z } from "zod";

export const profileSettingsSchema = z.object({
  fullName: z.string().trim().min(2, "Full Name must be at least 2 characters").max(100),
  phone: z.string().trim().max(30, "Phone must be at most 30 characters"),
  city: z.string().trim().min(1, "City is required"),
});

export const emailSettingsSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address").max(254),
});

export const passwordSettingsSchema = z
  .object({
    currentPassword: z.string().min(1, "Current Password is required").max(64),
    newPassword: z
      .string()
      .min(8, "New Password must be at least 8 characters")
      .max(64, "New Password must be at most 64 characters")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)/,
        "New Password must include at least one letter and one number",
      ),
    confirmPassword: z.string().min(1, "Confirm Password is required").max(64),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const notificationSettingsSchema = z.object({
  sendBookingNotifications: z.boolean(),
});

export const paymentSettingsSchema = z.object({
  cardNumber: z
    .string()
    .trim()
    .regex(/^\d{13,19}$/, "Card Number must be 13 to 19 digits"),
  cardName: z.string().trim().min(2, "Name On Card is required").max(100),
  expiry: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry must use MM/YY"),
  cvc: z
    .string()
    .trim()
    .regex(/^\d{3,4}$/, "CVC must be 3 or 4 digits"),
});

export type ProfileSettingsPayload = z.infer<typeof profileSettingsSchema>;
export type EmailSettingsPayload = z.infer<typeof emailSettingsSchema>;
export type PasswordSettingsPayload = z.infer<typeof passwordSettingsSchema>;
export type NotificationSettingsPayload = z.infer<typeof notificationSettingsSchema>;
export type PaymentSettingsPayload = z.infer<typeof paymentSettingsSchema>;
