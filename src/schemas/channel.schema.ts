import { z } from "zod";

export const channelSchema = z.object({
  title: z.string().min(1, "Channel title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().min(1, "Description is required").max(1000, "Description must be less than 1000 characters"),
  slug: z.string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug must be less than 50 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  access_code: z.string()
    .length(8, "Access code must be exactly 8 characters")
    .regex(/^[A-Za-z0-9]{8}$/, "Access code must contain only letters and numbers"),
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Please enter a valid hex color"),
  logo: z.string().optional(),
  submission_message: z.string().min(1, "Submission message is required").max(500, "Submission message must be less than 500 characters"),
  is_active: z.boolean().default(true),
});

export const formCreatorSchema = channelSchema;
export type ChannelData = z.infer<typeof channelSchema>;
export type FormCreatorData = z.infer<typeof formCreatorSchema>;
