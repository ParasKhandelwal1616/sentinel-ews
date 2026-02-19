import express from "express";
import { reportIncident } from "../controllers/incidentController.js";
import { getIncidents } from "../controllers/incidentController.js";

const router = express.Router();

router.post("/api/incidents", reportIncident);
router.get("/api/getincidents", getIncidents);

export default router;
