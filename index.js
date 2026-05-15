import OpenAI from "openai";
import { checkEnvironment } from "./utils.js";

// Initialize the OpenAI client using environment variables
const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
});

checkEnvironment();

const messages = [
  {
    role: "user",
    content:
      "Respond in under 100 words in a warm and friendly tone. Suggest some gifts for someone who loves travel and new food experiences. Skip intros and conclusions. Only output gift suggestions.",
  },
];

const response1 = await openai.chat.completions.create({
  model: process.env.AI_MODEL,
  messages: messages,
});

console.log(response1.choices[0].message.content);

messages.push(response1.choices[0].message);

messages.push({
  role: "user",
  content: "Make the suggestions more budget friendly and under $40.",
});

const response2 = await openai.chat.completions.create({
  model: process.env.AI_MODEL,
  messages: messages,
});

console.log(response2.choices[0].message.content);
