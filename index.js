import OpenAI from "openai";
import { autoResizeTextarea, checkEnvironment, setLoading } from "./utils.js";
checkEnvironment();

// Initialize an OpenAI client for your provider using env vars
const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
  dangerouslyAllowBrowser: true,
});

// Get UI elements
const giftForm = document.getElementById("gift-form");
const userInput = document.getElementById("user-input");
const outputContent = document.getElementById("output-content");

function start() {
  // Setup UI event listeners
  userInput.addEventListener("input", () => autoResizeTextarea(userInput));
  giftForm.addEventListener("submit", handleGiftRequest);
}

// Initialize messages array with system prompt
const messages = [
  {
    role: "system",
    content: `You are the Gift Genie!
    Make your gift suggestions thoughtful and practical.
    Your response must be under 100 words. 
    Skip intros and conclusions. 
    Only output gift suggestions.`,
  },
];

async function handleGiftRequest(e) {
  e.preventDefault();

  const userPrompt = userInput.value.trim();
  if (!userPrompt) return;

  messages.push({
    role: "user",
    content: userPrompt,
  });

  setLoading(true);

  try {
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL,
      messages,
    });

    const giftSuggestions = response.choices[0].message.content;
    outputContent.textContent = giftSuggestions;
  } catch (error) {
    console.error(error);
    outputContent.textContent = "Something went wrong. Please try again.";
  } finally {
    setLoading(false);
  }
}

start();
