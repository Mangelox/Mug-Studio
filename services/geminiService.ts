import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// Note: process.env.API_KEY is injected by the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates an image based on a text prompt using Gemini 2.5 Flash Image model.
 * Returns a base64 data URL string.
 */
export const generateDesignImage = async (prompt: string): Promise<string | null> => {
  // We assume API Key is available as per guidelines, but keeping check for runtime safety if desired,
  // though guidelines say to assume it's pre-configured.
  if (!process.env.API_KEY) {
    console.error("API Key missing");
    return null;
  }

  try {
    // Using gemini-2.5-flash-image as requested for general image generation tasks
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1", // Generate square, user can crop/resize
          numberOfImages: 1,
        }
      },
    });

    // Extract the image from the response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }

    console.warn("No image data found in response");
    return null;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    return null;
  }
};