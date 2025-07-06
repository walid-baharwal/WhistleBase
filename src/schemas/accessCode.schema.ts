import { z } from "zod";

export const accessCodeSchema = z.object({
  accessCode: z.string().trim().min(1, "Access code is required")
});