import { GoogleGenAI, Type } from "@google/genai";
import { PosePrompt } from "../types";

// Initialize Gemini Client
// Note: In a real deployment, ensure process.env.API_KEY is set.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Converts a File object to a Base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:image/xxx;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Analyzes the style of an uploaded image using Gemini 2.5 Flash.
 */
export const generateStyleAnalysis = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: "Analyze this wedding photo. Describe the style, lighting, colors, composition, and mood in a format suitable for a high-quality image generation prompt (like Midjourney). Focus on keywords like 'cinematic', 'soft focus', 'golden hour', etc. Keep it under 100 words."
          },
        ],
      },
    });

    return response.text || "Failed to generate analysis.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("AI analysis failed. Please try again.");
  }
};

/**
 * Generates varied pose prompts based on an uploaded image using Gemini 2.5 Flash.
 */
export const generatePoseVariations = async (base64Data: string, mimeType: string): Promise<PosePrompt[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: "Analyze the aesthetic of this wedding photo. Generate 8 different creative wedding photography pose prompts (e.g., Candid, Romantic, Artistic, Wide, Detail, etc.) that match this aesthetic. Return the result as a JSON array."
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "A short title for the pose (e.g., 'Candid: The Walk')" },
              prompt: { type: Type.STRING, description: "The detailed image generation prompt." }
            },
            required: ["title", "prompt"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from AI");
    
    return JSON.parse(jsonText) as PosePrompt[];
  } catch (error) {
    console.error("Gemini Pose Generation Error:", error);
    throw new Error("AI pose generation failed. Please try again.");
  }
};