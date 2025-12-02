import { GoogleGenAI } from "@google/genai";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY is not defined");
    }
    return new GoogleGenAI({ apiKey });
};

export const generateMysteryMessage = async (): Promise<string> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a short, interesting, or mysterious phrase (max 6 words) suitable for a Morse code transmission. Return ONLY the plain text, no markdown, no quotes.",
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating message:", error);
    return "SOS GEMINI ERROR";
  }
};

export const decodeComplicatedSignal = async (signal: string): Promise<string> => {
    try {
        const ai = getClient();
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Decode this potentially sloppy morse code signal. It might have spacing errors. 
          Signal: "${signal}". 
          Return ONLY the decoded text. If it is gibberish, try to find the closest meaningful word.`,
        });
    
        return response.text.trim();
      } catch (error) {
        console.error("Error decoding message:", error);
        return "ERROR";
      }
}