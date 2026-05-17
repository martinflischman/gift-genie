import OpenAI from "openai";
import { marked } from "marked";
import DOMPurify from "dompurify";
import {
  checkEnvironment,
  autoResizeTextarea,
  setLoading,
  showStream,
} from "./utils.js";

checkEnvironment();

const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
  dangerouslyAllowBrowser: true,
});

const giftForm = document.getElementById("gift-form");
const userInput = document.getElementById("user-input");
const outputContent = document.getElementById("output-content");

const messages = [
  {
    role: "system",
    content: `You are the Gift Genie!
    Make your gift suggestions thoughtful and practical.
    The user will describe the gift's recipient.
    Your response must be under 100 words. 
    Skip intros and conclusions. 
    Only output gift suggestions.`,
  },
];

function start() {
  userInput.addEventListener("input", () => autoResizeTextarea(userInput));
  giftForm.addEventListener("submit", handleGiftRequest);
}

async function handleGiftRequest(e) {
  e.preventDefault();

  const userPrompt = userInput.value.trim();
  if (!userPrompt) return;

  setLoading(true);

  messages.push({ role: "user", content: userPrompt });

  try {
    const stream = await openai.chat.completions.create({
      model: process.env.AI_MODEL,
      messages,
      stream: true,
    });

    showStream();

    let giftSuggestions = "";

    for await (const chunk of stream) {
      const chunkText = chunk.choices[0]?.delta?.content || "";
      giftSuggestions += chunkText;
      outputContent.innerHTML = DOMPurify.sanitize(
        marked.parse(giftSuggestions),
      );
    }
  } catch (error) {
    console.error(error);
    outputContent.textContent =
      "Sorry, I can't access what I need right now. Please try again.";
  } finally {
    setLoading(false);
  }
}

start();
