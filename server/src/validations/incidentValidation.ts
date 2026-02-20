import { z } from "zod";

export const incidentSchema = z.object({
  topic: z.string().min(5, "Topic must be at least 5 characters"),
  description: z.string().min(10, "Description is too short"),
  severity: z.number().min(1).max(5),
  longitude: z.number(),
  latitude: z.number(),
  status: z.enum(["pending", "verified", "resolved"]).optional(),
});
