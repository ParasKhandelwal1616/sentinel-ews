import { Request, Response, NextFunction } from "express";
import Incident from "../models/Incident.js";
import User from "../models/User.js"; 
import { sendEmergencyBlast, IncidentEmailData } from "../utils/mailer.js";

// 1. CREATE INCIDENT & TRIGGER BROADCASTS (Upgraded for Cloudinary)
export const createIncident = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // 1. Extract data from the multipart form
    const { topic, description, severity } = req.body;
    let locationData = req.body.location;

    // 2. Parse the location back into JSON (FormData sends it as a string)
    if (typeof locationData === 'string') {
      locationData = JSON.parse(locationData);
    }

    // 3. 🔴 NEW: Intercept the secure Cloudinary URL from Multer
    // (We cast req to any here to bypass strict TS complaining about Multer's .file object)
    const imageUrl = (req as any).file ? (req as any).file.path : null;

    // 4. Save the threat to MongoDB, including the visual evidence
    const incident = await Incident.create({
      topic,
      description,
      severity: Number(severity), // Ensure severity stays a number
      location: locationData,
      imageUrl: imageUrl // 🔴 NEW: The secure cloud link
    });

    // 5. 🔥 REAL-TIME BROADCAST (Socket.io)
    const io = req.app.get("io");
    if (io) {
      io.emit("new-incident", incident);
    }

    // 6. 🚨 GEO-FENCED ALERT ENGINE
    if (incident.severity >= 3) {
      console.log(`⚠️ High-Severity Threat Detected (Level ${incident.severity})! Calculating 5km blast radius...`);
      
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

      const targetEmails: string[] = nearbyUsers
        .map((user) => user.email)
        .filter((email): email is string => !!email); 

      if (targetEmails.length > 0) {
        const emailData: IncidentEmailData = {
          topic: incident.topic,
          description: incident.description,
          severity: incident.severity,
          location: incident.location,
        };

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
    const maxDistance = dist ? parseInt(dist as string) : 5000;

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

// 4. RESOLVE INCIDENT
export const resolveIncident = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const incident = await Incident.findByIdAndDelete(id);

    if (!incident) {
      return res.status(404).json({ success: false, message: "Threat not found" });
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("threat-resolved", id); 
    }

    console.log(`🛡️ Threat ${id} resolved and cleared from radar.`);
    return res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};