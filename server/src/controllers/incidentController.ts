import { Request, Response } from "express";
import Incident from "../models/Incident.js";

export const reportIncident = async (req: Request, res: Response) => {
  try {
    const { topic, longitude, latitude, severity, description, status } =
      req.body;

    const incident = await Incident.create({
      topic,
      severity,
      description,
      status,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    });

    return res.status(201).json({
      success: true,
      data: incident,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to report incident",
      error,
    });
  }
};
