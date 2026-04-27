import { GoogleGenAI } from "@google/genai";

let geminiClient: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!geminiClient) {
    // Check both standard process.env and Vite's import.meta.env
    const key = process.env.GEMINI_API_KEY || (import.meta.env && import.meta.env.VITE_GEMINI_API_KEY);
    
    if (!key) {
      throw new Error('GEMINI_API_KEY or VITE_GEMINI_API_KEY environment variable is required. Please set it in your Vercel project settings.');
    }
    geminiClient = new GoogleGenAI({ apiKey: key });
  }
  return geminiClient;
}
