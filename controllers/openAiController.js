// const OpenAI = require("openai");
// require("dotenv").config();

// async function analyzeEmails(emailBody) {
//   try {
//     const prompt = emailBody;
//     const maxTokens = 500;
//     const n = 1;

//     const openai = new OpenAI({
//       apiKey: process.env.OPEN_AI_API_KEY,
//     });
//     const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       prompt: prompt,
//       max_tokens: maxTokens,
//       n: n,
//     });

//     const { analyzedResults } = response.data;
//     if (analyzedResults && analyzedResults.length > 0) {
//       const completion = analyzedResults[0].text.trim();
//       return completion;
//     } else {
//       return false;
//     }
//   } catch (error) {
//     console.error("OpenAI API request failed:", error);
//   }
// }

// module.exports = { analyzeEmails };
