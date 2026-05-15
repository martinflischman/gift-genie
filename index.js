import OpenAI from "openai";
import { checkEnvironment } from "./utils.js";

// Initialize the OpenAI client using environment variables
const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
});

checkEnvironment();

const response = await openai.chat.completions.create({
  model: process.env.AI_MODEL,
  messages: [
    {
      role: "user",
      content:
        "Respond in under 100 words in a warm and friendly tone. Suggest some gifts for someone who loves travel and new food experiences. Skip intros and conclusions. Only output gift suggestions.",
    },
  ],
});

// Extract the model's generated text from the response
console.log(response.choices[0].message.content);
