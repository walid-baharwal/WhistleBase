import { z } from "zod";

export const requestPasswordResetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const verifyResetCodeSchema = z.object({
  email: z.string().email(),
  reset_code: z.string().length(6, "Reset code must be 6 digits"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  reset_code: z.string().length(6),
  new_password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string().min(8),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});
