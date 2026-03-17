import { GoogleGenerativeAI } from "@google/generative-ai";

/* -------------------------------------------------------------------------- */
/* CHECK API KEY */
/* -------------------------------------------------------------------------- */

if (!process.env.GOOGLE_AI_KEY) {
  console.warn("⚠️ GOOGLE_AI_KEY is missing in environment variables");
}

/* -------------------------------------------------------------------------- */
/* INIT MODEL */
/* -------------------------------------------------------------------------- */

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.4,
    responseMimeType: "application/json"
  },

  systemInstruction: `
You are a senior MERN stack developer with 10 years of experience.

Rules:
- Always generate modular and scalable code
- Follow best practices
- Handle errors properly
- Maintain existing code structure
- Write readable comments
- Never break existing code
- Avoid using filenames like routes/index.js
- Always return valid JSON response
`
});

/* -------------------------------------------------------------------------- */
/* GENERATE RESULT */
/* -------------------------------------------------------------------------- */

export const generateResult = async (prompt) => {

  if (!prompt) {
    throw new Error("Prompt is required");
  }

  try {

    const result = await model.generateContent(prompt);

    const text = result?.response?.text();

    if (!text) {
      return JSON.stringify({
        text: "AI returned an empty response"
      });
    }

    return text;

  } catch (error) {

    console.error("AI Error:", error.message);

    return JSON.stringify({
      text: "AI service temporarily unavailable"
    });

  }
};