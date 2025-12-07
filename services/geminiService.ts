
import { GoogleGenAI } from "@google/genai";

// Initialize the client with the API key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Sends the image to Gemini to add a Santa hat.
 * @param base64Data Raw base64 string of the original image
 * @param mimeType Mime type of the image (e.g., image/jpeg)
 * @returns The base64 data URL of the generated image
 */
export const addSantaHatToImage = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: "Edit this image to put a red festive Christmas Santa Claus hat on the person's head. The tail of the hat must drape down to the right side (viewer's right). Ensure the entire hat is visible and not cut off by the top or side edges of the image. The hat should fit naturally, matching lighting and shadows. Keep the person's face clearly visible and unchanged.",
          },
        ],
      },
    });

    // Iterate through parts to find the image output
    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("模型未返回图像数据，请重试。");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "生成图片时发生错误");
  }
};
