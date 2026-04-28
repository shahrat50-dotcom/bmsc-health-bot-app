import { GoogleGenAI } from "@google/genai";

let geminiClient: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!geminiClient) {
    // In Vite, use import.meta.env for client-side variables
    const key = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);
    
    if (!key) {
      throw new Error('VITE_GEMINI_API_KEY environment variable is required. Please set it in your Vercel project settings.');
    }
    geminiClient = new GoogleGenAI({ apiKey: key });
  }
  return geminiClient;
}
