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

// Initialize messages array with system prompt
const messages = [
  {
    role: "system",
    content: `You are the Gift Genie!
    The user will describe the gift's recipient.
    
    For each gift suggestion, use this structure:
    ### [Gift Name]
    A short explanation of why this gift works for the recipient.
    
    Provide 3-5 gift suggestions.
    
    You MUST always end with a ## Questions for you section with 2-3 follow-up questions that would help you improve the recommendations. This section is required.
    
    Skip intros and conclusions.`,
  },
];

function start() {
  // Setup UI event listeners
  userInput.addEventListener("input", () => autoResizeTextarea(userInput));
  giftForm.addEventListener("submit", handleGiftRequest);
}

async function handleGiftRequest(e) {
  // Prevent default form submission
  e.preventDefault();

  // Get user input, trim whitespace, exit if empty
  const userPrompt = userInput.value.trim();
  if (!userPrompt) return;

  // Set loading state
  setLoading(true);

  // Add user message to global messages array
  messages.push({ role: "user", content: userPrompt });

  try {
    // Send a streaming chat completions request
    const stream = await openai.chat.completions.create({
      model: process.env.AI_MODEL,
      messages,
      stream: true,
    });

    let giftSuggestions = "";

    // Show output container immediately for streaming feedback
    showStream();

    // Process each chunk as it arrives
    for await (const chunk of stream) {
      const chunkText = chunk.choices[0]?.delta?.content || "";
      giftSuggestions += chunkText;

      // Convert Markdown to HTML
      const html = marked.parse(giftSuggestions);

      // Sanitize the HTML
      const safeHTML = DOMPurify.sanitize(html);

      // Display the sanitized HTML
      outputContent.innerHTML = safeHTML;
    }

    console.log(giftSuggestions);
  } catch (error) {
    console.error(error);
    outputContent.textContent =
      "Sorry, I can't access what I need right now. Please try again.";
  } finally {
    setLoading(false);
  }
}

start();
