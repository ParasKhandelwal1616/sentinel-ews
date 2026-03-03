import nodemailer from 'nodemailer';

// 🛡️ STRICT TYPING: Define exactly what an Incident looks like for the mailer
export interface IncidentEmailData {
  topic: string;
  description: string;
  severity: number;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export const sendEmergencyBlast = async (recipientEmails: string[], incident: IncidentEmailData): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER as string, 
        pass: process.env.EMAIL_PASS as string  
      }
    });

    const severityLabel = incident.severity >= 4 ? "CRITICAL" : "HIGH";
    const [lng, lat] = incident.location.coordinates;
    
    const mailOptions = {
      from: `"SENTINEL EWS Command" <${process.env.EMAIL_USER}>`,
      bcc: recipientEmails, // BCC protects user privacy
      subject: `🚨 [${severityLabel} ALERT] ${incident.topic.toUpperCase()} IN YOUR AREA`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #333; border-radius: 8px; overflow: hidden;">
          <div style="background-color: ${incident.severity >= 4 ? '#ff4444' : '#ff8c42'}; color: white; padding: 15px; text-align: center;">
            <h2 style="margin: 0; letter-spacing: 2px;">SENTINEL EMERGENCY BROADCAST</h2>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9; color: #333;">
            <h3 style="margin-top: 0; color: #111; text-transform: uppercase;">Threat Detected: ${incident.topic}</h3>
            <p style="font-size: 16px; line-height: 1.5;">${incident.description}</p>
            <div style="margin-top: 20px; padding: 10px; background-color: #eee; border-left: 4px solid #ff4444;">
              <strong>Severity Level:</strong> ${incident.severity}/5 <br/>
              <strong>Coordinates:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">
              You are receiving this automated alert because your registered location is within a 5km radius of this threat. Stay safe.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`📡 [COMM LINK] Blast sent successfully to ${recipientEmails.length} operators.`);
  } catch (error) {
    console.error(`❌ [COMM LINK FAILED] Error sending blast:`, error);
  }
};