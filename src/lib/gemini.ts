import { GoogleGenAI } from "@google/genai";

let geminiClient: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!geminiClient) {
    // In Vite, use import.meta.env for client-side variables
    const key = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!key) {
      throw new Error('API key is missing. For Vercel, add VITE_GEMINI_API_KEY in Project Settings > Environment Variables. For local development, add it to your .env file.');
    }
    geminiClient = new GoogleGenAI({ apiKey: key });
  }
  return geminiClient;
}
