import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiModel = "gemini-3-flash-preview";

export async function generateResponse(prompt: string, systemInstruction?: string) {
  try {
    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "抱歉，我现在无法回答。请稍后再试。";
  }
}

export async function polishSentence(sentence: string) {
  const systemInstruction = `You are an expert English teacher. 
  Your task is to polish the user's English sentence to make it sound more natural, professional, or idiomatic.
  Provide:
  1. The polished version.
  2. A brief explanation of why the change was made (in Chinese).
  3. The Chinese translation.
  Format the output clearly.`;
  
  return generateResponse(`Polish this sentence: "${sentence}"`, systemInstruction);
}

export async function chatWithTutor(history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  try {
    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: history,
      config: {
        systemInstruction: "You are a friendly and encouraging English tutor. Help the user practice English speaking. Keep your responses concise and engaging. Correct their mistakes gently if necessary.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having some trouble connecting. Let's try again in a moment.";
  }
}
