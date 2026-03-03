import { Request, Response, NextFunction } from "express";
import Incident from "../models/Incident.js";
import User from "../models/User.js"; // Ensure you have this model
import { sendEmergencyBlast, IncidentEmailData } from "../utils/mailer.js";

// 1. CREATE INCIDENT & TRIGGER BROADCASTS
export const createIncident = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // 1. Save the threat to MongoDB
    const incident = await Incident.create(req.body);

    // 2. 🔥 REAL-TIME BROADCAST (Socket.io)
    const io = req.app.get("io");
    if (io) {
      io.emit("new-incident", incident);
    }

    // 3. 🚨 GEO-FENCED ALERT ENGINE (Only trigger on Severity 3, 4, or 5)
    if (incident.severity >= 3) {
      console.log(`⚠️ High-Severity Threat Detected (Level ${incident.severity})! Calculating 5km blast radius...`);
      
      // Find users within 5,000 meters (5km) of the threat
      const nearbyUsers = await User.find({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: incident.location.coordinates, // [lng, lat]
            },
            $maxDistance: 5000, 
          },
        },
      });

      // Extract emails securely
      const targetEmails: string[] = nearbyUsers
        .map((user) => user.email)
        .filter((email): email is string => !!email); 

      if (targetEmails.length > 0) {
        // Cast to our strict mailer interface
        const emailData: IncidentEmailData = {
          topic: incident.topic,
          description: incident.description,
          severity: incident.severity,
          location: incident.location,
        };

        // Fire and forget the email blast (don't await so the UI feels instant)
        sendEmergencyBlast(targetEmails, emailData).catch(console.error);
      } else {
        console.log(`Radar clear. No users found within 5km radius.`);
      }
    }

    return res.status(201).json({ success: true, data: incident });
  } catch (error) {
    next(error);
  }
};

// 2. GET ALL INCIDENTS (For the Feed)
export const getIncidents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: incidents.length,
      data: incidents,
    });
  } catch (error) {
    next(error);
  }
};

// 3. GET NEARBY INCIDENTS (For the Operator Radar Filter)
export const getnearbyincidents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { lng, lat, dist } = req.query; 

    if (!lng || !lat) {
      return res.status(400).json({
        success: false,
        message: "Please provide both lng and lat query parameters",
      });
    }

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
    next(error);
  }
};

export const resolveIncident = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    // 1. Find and delete from MongoDB
    const incident = await Incident.findByIdAndDelete(id);

    if (!incident) {
      return res.status(404).json({ success: false, message: "Threat not found" });
    }

    // 2. 🔥 REAL-TIME BROADCAST: Tell all clients to remove this pin instantly
    const io = req.app.get("io");
    if (io) {
      io.emit("threat-resolved", id); // We send the ID so the frontend knows which pin to delete
    }

    console.log(`🛡️ Threat ${id} resolved and cleared from radar.`);
    return res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};