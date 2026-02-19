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

export const getIncidents = async (req: Request, res: Response) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: incidents.length,
      data: incidents,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch incidents",
      error,
    });
  }
};

export const getnearbyincidents = async (req: Request, res: Response) => {
  try {
    const { lng, lat, dist } = req.query; // Short names are common in URLs

    if (!lng || !lat) {
      return res.status(400).json({
        success: false,
        message: "Please provide both lng and lat query parameters",
      });
    }

    // Convert to numbers and define a default distance if 'dist' is missing
    const longitude = parseFloat(lng as string);
    const latitude = parseFloat(lat as string);
    const maxDistance = dist ? parseInt(dist as string) : 5000; // Default 5km

    const incidents = await Incident.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistance,
        },
      },
    });

    return res.status(200).json({
      success: true,
      count: incidents.length,
      distance_searched: `${maxDistance / 1000}km`,
      data: incidents,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch nearby incidents",
      error,
    });
  }
};
