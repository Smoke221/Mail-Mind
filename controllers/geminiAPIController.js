const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();


const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function generateText(prompt) {
  try {

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    return text;
  } catch (error) {
    console.error("Google Generative AI request failed:", error);
    throw error;
  }
}

module.exports = { generateText };
