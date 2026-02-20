import express from "express";
import {
  reportIncident,
  getIncidents,
  getnearbyincidents,
} from "../controllers/incidentController.js";
import { validate } from "../middleware/validateMiddleware.js";
import { incidentSchema } from "../validations/incidentValidation.js";

const router = express.Router();

// Logic: Since this router is hooked to "/api/incidents" in index.ts,
// a simple "/" here means "POST /api/incidents"
router.post("/", reportIncident);

// Logic: This becomes "GET /api/incidents"
router.get("/", getIncidents);

// Logic: This becomes "GET /api/incidents/nearby"
router.get("/nearby", getnearbyincidents);

router.post("/", validate(incidentSchema), reportIncident);

export default router;
