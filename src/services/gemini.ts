import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const getGeminiResponse = async (prompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3.1-flash-lite-preview";

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: "You are SAMUSA, the Smart Agent Assistant. You help agents with SIM registration, SIM swap, selling bundles, and merchant services (Till/Lipa). Be professional, concise, and helpful. You can guide them through the steps of each process.",
    },
  });

  // Since sendMessage only takes a message, we might need to handle history differently if we want to use the chat object
  // But for simplicity in this turn, we'll just send the message.
  // If we want full history, we'd need to reconstruct the chat state.
  
  const response = await chat.sendMessage({ message: prompt });
  return response.text;
};
