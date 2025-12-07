
import { GoogleGenAI } from "@google/genai";

/**
 * Safely retrieves the API Key from various environment configurations.
 * Supports Vite (import.meta.env), CRA/Node (process.env), and Global Polyfills.
 */
const getEnvApiKey = (): string => {
  try {
    // 1. Try standard process.env (Node/Webpack/CRA)
    if (typeof process !== 'undefined' && process.env?.API_KEY) return process.env.API_KEY;
    if (typeof process !== 'undefined' && process.env?.VITE_API_KEY) return process.env.VITE_API_KEY;
    if (typeof process !== 'undefined' && process.env?.REACT_APP_API_KEY) return process.env.REACT_APP_API_KEY;
    
    // 2. Try Vite's import.meta.env (modern browsers/Vite)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_KEY) return import.meta.env.VITE_API_KEY;
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env?.API_KEY) return import.meta.env.API_KEY;

    // 3. Fallback to window object polyfill
    if (typeof window !== 'undefined' && (window as any).process?.env?.API_KEY) return (window as any).process.env.API_KEY;
    
    return '';
  } catch (e) {
    return '';
  }
};

/**
 * Sends the image to Gemini to add a Santa hat.
 * @param base64Data Raw base64 string of the original image
 * @param mimeType Mime type of the image (e.g., image/jpeg)
 * @param apiKey The API key to use for this request.
 * @returns The base64 data URL of the generated image
 */
export const addSantaHatToImage = async (base64Data: string, mimeType: string, apiKey?: string): Promise<string> => {
  try {
    // Logic: User Provided Key > Env Variable Key
    const envKey = getEnvApiKey();
    const keyToUse = apiKey && apiKey.trim() !== '' ? apiKey : envKey;

    if (!keyToUse) {
      throw new Error("未检测到 API Key。请点击右上角设置图标输入您的 Google Gemini API Key，或在部署环境中配置环境变量。");
    }

    // Initialize the client dynamically to support changing keys at runtime
    const ai = new GoogleGenAI({ apiKey: keyToUse });

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
    // Handle specific API key errors nicely
    if (error.message?.includes('API key') || error.status === 403 || error.status === 400) {
       throw new Error("API Key 无效或过期，请检查设置。");
    }
    throw new Error(error.message || "生成图片时发生错误");
  }
};