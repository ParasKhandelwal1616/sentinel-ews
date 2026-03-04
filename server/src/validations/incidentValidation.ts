import { z } from "zod";

export const incidentSchema = z.object({
  topic: z.string().min(5, "Topic must be at least 5 characters"),
  description: z.string().min(10, "Description is too short"),
  severity: z.number().min(1).max(5),
  
  // 🔴 FIXED: Upgraded to strict MongoDB GeoJSON validation
  location: z.object({
    type: z.literal("Point"), // Must be exactly the string "Point"
    coordinates: z.tuple([z.number(), z.number()]), // Must be an array of exactly two numbers: [lng, lat]
  }),
  
  status: z.enum(["pending", "verified", "resolved"]).optional(),
});