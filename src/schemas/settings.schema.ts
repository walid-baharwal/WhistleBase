import { z } from "zod";

export const organizationSettingsSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
});

export const userSettingsSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
});

export const passwordSettingsSchema = z.object({
  current_password: z.string().min(8, "Current password must be at least 8 characters"),
  new_password: z.string().min(8, "New password must be at least 8 characters"),
  confirm_password: z.string().min(8, "Confirm password must be at least 8 characters"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});
