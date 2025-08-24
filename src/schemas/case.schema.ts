import { z } from "zod";

export const createCaseSchema = z.object({
  category: z.string().min(1, "Category is required").max(100, "Category must be less than 100 characters"),
  content: z.string().min(10, "Content must be at least 10 characters").max(5000, "Content must be less than 5000 characters"),
  access_code: z.string().min(1, "Access code is required"),
});

export type CreateCaseData = z.infer<typeof createCaseSchema>;
