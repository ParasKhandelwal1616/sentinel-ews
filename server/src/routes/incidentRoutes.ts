import express from "express";
import { reportIncident } from "../controllers/incidentController.js";

const router = express.Router();

router.post("/api/incidents", reportIncident);

export default router;
