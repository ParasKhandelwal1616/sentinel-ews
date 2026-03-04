import express from "express";
import {
  createIncident,
  getIncidents,
  getnearbyincidents,
  resolveIncident
} from "../controllers/incidentController.js";
import { validate } from "../middleware/validateMiddleware.js";
import { incidentSchema } from "../validations/incidentValidation.js";

const router = express.Router();

// 1. CREATE INCIDENT: Validates the data, saves to DB, and triggers Email/Socket broadcasts
router.post("/", createIncident);
// 2. GET ALL INCIDENTS: Fetches the historical feed
router.get("/", getIncidents);

// 3. GET NEARBY INCIDENTS: The 5km Proximity Radar
router.get("/nearby", getnearbyincidents);

// 4. RESOLVE INCIDENT: Deletes from DB and vaporizes the pin for all operators
router.delete("/:id", resolveIncident);

export default router;