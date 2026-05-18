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
    Make your gift suggestions thoughtful and practical.
    The user will describe the gift's recipient.
    Your response must be in structured Markdown.
    Each gift must:
      - Have a clear heading
      - A short explanation of why it would work

    If the user mentions a location or a time constraint,
    add another section under each gift that gives the user
    a step by step guide on where and how they can get the gift.

    Skip intros and conclusions.
    Only output gift suggestions.
    
    End with a section with an H2 heading titled "Questions for you"
    that contains follow-ups that would help improve the
    gift suggestions`,
  },
  {
    role: "user",
    content:
      "My friend in Cape Town loves the outdoors, good food, traveling and live music. What can I get him as a Christmas gift, nothing more than R1000.",
  },
  {
    role: "assistant",
    content: `### Guided Hike Experience Voucher

A voucher for a guided hike up Lion's Head or Table Mountain with a local guide — perfect for someone who loves the outdoors and Cape Town's natural beauty.

**How to get it:**
1. Visit GetYourGuide.com or Airbnb Experiences and search "Cape Town hiking".
2. Filter by price under R500 to leave room for another gift.
3. Purchase a voucher and print or email it as the gift.

---

### Craft Beer & Braai Snack Hamper

A curated hamper of local Cape Town craft beers paired with artisan biltong and snacks — great for a foodie who loves local flavour.

**How to get it:**
1. Visit Faithful to Nature or The Biltong Shop online.
2. Search for gift hampers under R400.
3. Add to cart and select delivery to your address or directly to your friend.

---

### Live Music Event Tickets

Tickets to an upcoming live music event in Cape Town — check what's on at Kirstenbosch, The Assembly, or Shimmy Beach Club.

**How to get it:**
1. Visit Webtickets.co.za or Quicket.co.za.
2. Search for upcoming Cape Town live music events.
3. Filter by date and price and purchase tickets directly.

---

## Questions for you
1. What kind of music does your friend enjoy?
2. Does he prefer experiences or physical gifts?
3. Is there a specific area of Cape Town he frequents?`,
  },
  {
    role: "user",
    content:
      "online shopping. under R500. gift for my dad who loves braaiing and the outdoors",
  },
  {
    role: "assistant",
    content: `### Braai Spice Gift Set

A curated set of wood-fired rubs and marinades built for someone who takes their braai seriously. Practical, personal, and always appreciated.

**How to get it:**
1. Go to Faithful to Nature or Woolworths online.
2. Search for "braai spice set" or "BBQ rub gift set".
3. Filter by price under R500.
4. Add to cart and select standard or express delivery.

---

### Silicone Braai Gloves

Heat-resistant gloves designed for handling hot grates and coals — far better than a folded cloth.

**How to get it:**
1. Visit Takealot.com and search "silicone braai gloves".
2. Filter by Prime delivery if you need it quickly.
3. Choose a highly rated pair under R200 to stay in budget.
4. Proceed to checkout and select your delivery address.

---

### Portable Camping Lantern

A rechargeable LED lantern perfect for outdoor evenings around the fire.

**How to get it:**
1. Search "camping lantern rechargeable" on Takealot or Leroy Merlin online.
2. Filter by price — good options available between R150–R400.
3. Check reviews and battery life before purchasing.
4. Add to cart and complete checkout.

---

## Questions for you
1. Does your dad braai with wood, charcoal, or gas?
2. Does he camp or hike as well, or mainly braai at home?
3. Would you prefer a single quality item or a few smaller gifts?`,
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
  messages.push({
    role: "user",
    content: `Generate fresh gift ideas for this new user request: ${userPrompt}`,
  });

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
      const chunkContent = chunk.choices[0]?.delta?.content;
      if (!chunkContent) continue;
      giftSuggestions += chunkContent;

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
