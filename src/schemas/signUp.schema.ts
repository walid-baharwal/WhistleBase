import { z } from "zod";

// Step 1: Personal information with email and password
export const personalStepSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  last_name: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

// Step 2: Email verification
export const verificationCodeSchema = z.object({
  verification_code: z.string().length(6, "Verification code must be 6 digits"),
});

// Step 3: Organization details
export const organizationStepSchema = z.object({
  organization_name: z.string().min(1, "Organization name is required").max(100, "Organization name must be less than 100 characters"),
  country: z.string().min(1, "Please select a country"),
});

// Combined schema for final submission
export const completeSignupSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  password: z.string().min(8),
  organization_name: z.string().min(1),
  country: z.string().min(1),
});

export type PersonalStepData = z.infer<typeof personalStepSchema>;
export type VerificationCodeData = z.infer<typeof verificationCodeSchema>;
export type OrganizationStepData = z.infer<typeof organizationStepSchema>;
export type CompleteSignupData = z.infer<typeof completeSignupSchema>;
