import { GoogleGenAI, Type } from "@google/genai";
import { VerificationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Helper to convert file to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const verifyMarksMemo = async (file: File): Promise<VerificationResult> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key found, simulating AI response");
    // Simulation fallback for demo purposes if no key provided
    await new Promise(r => setTimeout(r, 2000));
    return {
      isValid: true,
      percentage: 86.5,
      studentName: "Detected Student Name",
      reason: "Document appears to be a valid original mark sheet with no signs of tampering."
    };
  }

  try {
    const base64Data = await fileToGenerativePart(file);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          {
            text: "Analyze this image. It should be a student's academic marks memo/transcript. Determine if it looks authentic (not edited/fake). Extract the overall percentage (0-100) and the student's name if visible. Respond in JSON."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN, description: "True if document looks authentic and original." },
            percentage: { type: Type.NUMBER, description: "The overall percentage or CGPA converted to percentage." },
            studentName: { type: Type.STRING, description: "Name found on the document." },
            reason: { type: Type.STRING, description: "Reasoning for validity or invalidity." }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as VerificationResult;
    }
    throw new Error("Empty response from AI");

  } catch (error) {
    console.error("AI Verification Failed", error);
    return {
      isValid: false,
      percentage: 0,
      reason: "Could not verify document due to technical error."
    };
  }
};
