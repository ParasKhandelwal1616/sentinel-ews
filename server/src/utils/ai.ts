import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const evaluateThreatLevel = async (topic: string, description: string, imageUrl?: string | null) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    You are an elite emergency response AI for the Sentinel Early Warning System. 
    Analyze the following field report from an operator:
    
    Topic: "${topic}"
    Description: "${description}"

    Evaluate the severity of this incident on a scale of 1 to 5.
    
    If an image is provided alongside this text, act as a visual lie detector. Does the image actually show what the text describes? 

    Respond ONLY with a valid JSON object matching this exact structure, with no markdown formatting:
    {
      "severity": 3, 
      "confidence": "high", 
      "reasoning": "Brief explanation of severity.", 
      "isVerified": true
    }
    
    IMPORTANT: Set "isVerified" to false ONLY if the image clearly and obviously contradicts the text (e.g., reporting a massive fire but showing a picture of a coffee cup). If there is no image, set it to true.
    `;

    // 1. We start building the payload array
    const contents: any[] = [prompt];

    // 2. 🔴 NEW: If an image exists, fetch it and convert it to Base64 for Gemini
    if (imageUrl) {
      console.log(`👁️ Fetching visual evidence from Cloudinary to show the AI...`);
      const imageResponse = await fetch(imageUrl);
      const arrayBuffer = await imageResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      contents.push({
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: "image/jpeg" // Gemini handles standard web images perfectly this way
        }
      });
    }

    // 3. Fire the multimodal prompt
    const result = await model.generateContent(contents);
    const responseText = result.response.text();

    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
    
  } catch (error) {
    console.error("❌ AI Evaluation Failed:", error);
    return null; 
  }
};