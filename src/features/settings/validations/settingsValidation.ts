import { z } from "zod";

export const profileSettingsSchema = z.object({
  fullName: z.string().trim().min(2, "Full Name must be at least 2 characters long.").max(100),
  phone: z.string().trim().max(20, "Phone must be at most 20 characters."),
  cityId: z.uuid("Select a valid city.").nullable(),
});

export const emailSettingsSchema = z.object({
  newEmail: z.string().trim().toLowerCase().email("Invalid email address.").max(254),
});

export const passwordSettingsSchema = z
  .object({
    currentPassword: z.string().min(1, "Current Password is required.").max(64),
    newPassword: z
      .string()
      .min(8, "New Password must be at least 8 characters.")
      .max(128, "New Password must be at most 128 characters.")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)/,
        "New Password must include at least one letter and one number.",
      ),
    confirmPassword: z.string().min(1, "Confirm Password is required.").max(64),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const notificationSettingsSchema = z.object({
  sendBookingNotifications: z.boolean(),
});

export type ProfileSettingsPayload = z.infer<typeof profileSettingsSchema>;
export type EmailSettingsPayload = z.infer<typeof emailSettingsSchema>;
export type PasswordSettingsPayload = z.infer<typeof passwordSettingsSchema>;
export type NotificationSettingsPayload = z.infer<typeof notificationSettingsSchema>;
