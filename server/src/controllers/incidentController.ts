import { Request, Response, NextFunction } from "express";
import Incident from "../models/Incident.js";
import User from "../models/User.js"; 
import { sendEmergencyBlast, IncidentEmailData } from "../utils/mailer.js";
import { evaluateThreatLevel } from "../utils/ai.js";

// 1. CREATE INCIDENT & TRIGGER BROADCASTS (Upgraded for Cloudinary)
export const createIncident = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { topic, description, severity } = req.body;
    let locationData = req.body.location;

    if (typeof locationData === 'string') {
      locationData = JSON.parse(locationData);
    }

    const imageUrl = (req as any).file ? (req as any).file.path : null;

    let finalSeverity = Number(severity);
    let finalDescription = description;

    console.log(`🧠 Sending threat "${topic}" to AI for evaluation...`);
    
    const aiAssessment = await evaluateThreatLevel(topic, description, imageUrl);

    if (aiAssessment && aiAssessment.severity) {
      console.log(`🤖 AI Override! Assigned Severity: ${aiAssessment.severity} / 5`);
      finalSeverity = aiAssessment.severity;
      
      let aiNote = `\n\n🤖 AI Assessment: Overrode severity to Level ${aiAssessment.severity}. ${aiAssessment.reasoning}`;
      
      // 🔴 FIXED: STRICT BOUNCER LOGIC
      if (aiAssessment.isVerified === false) {
        console.log(`🚨 AI DETECTED FALSE EVIDENCE! Blocking report from database.`);
        // KILL THE REQUEST RIGHT HERE. DO NOT SAVE. DO NOT BROADCAST.
        return res.status(400).json({ 
          success: false, 
          message: "VISUAL VERIFICATION FAILED: The attached image heavily contradicts the reported disaster. Report rejected." 
        });
      } else if (imageUrl && aiAssessment.isVerified === true) {
        console.log(`✅ Visual evidence verified by AI.`);
        aiNote += `\n\n✅ VISUAL VERIFICATION PASSED: The AI confirms the image matches the report.`;
      }

      finalDescription = `${description}${aiNote}`;
    } else {
      console.log(`⚠️ AI timeout or failure. Falling back to operator's manual severity.`);
    }

    // This will only run if the AI verified the image (or if no image was uploaded)
    const incident: any = await Incident.create({
      topic,
      description: finalDescription,
      severity: finalSeverity, 
      location: locationData,
      imageUrl: imageUrl 
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("new-incident", incident);
    }

    if (incident.severity >= 3) {
      console.log(`⚠️ High-Severity Threat Detected (Level ${incident.severity})! Calculating 5km blast radius...`);
      
      const nearbyUsers = await User.find({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: incident.location.coordinates, 
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
          description: incident.description || "",
          severity: incident.severity,
          location: {
            type: incident.location.type,
            coordinates: incident.location.coordinates as [number, number],
          },
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