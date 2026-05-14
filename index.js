import OpenAI from "openai";
import { checkEnvironment } from "./utils.js";

const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
  dangerouslyAllowBrowser: true,
});

checkEnvironment();

const userPrompt =
  "Suggest some gifts for someone who loves travel, music and new food experiences.";

const userMessage = {
  role: "user",
  content: userPrompt,
};

const response = await openai.chat.completions.create({
  model: process.env.AI_MODEL,
  messages: [userMessage],
});

console.log(response.choices[0].message.content);
