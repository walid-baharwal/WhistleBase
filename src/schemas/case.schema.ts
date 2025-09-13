import { z } from "zod";

export const createCaseSchema = z.object({
  category: z.string().min(1, "Category is required").max(100, "Category must be less than 100 characters"),
  content: z.string().optional(),
  access_code: z.string().min(1, "Access code is required"),
});

export type CreateCaseData = z.infer<typeof createCaseSchema>;
