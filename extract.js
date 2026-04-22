// Drew's Recipe Extractor API
// Deployed on Vercel - receives a URL from the iOS Shortcut,
// fetches the page content, and uses Claude to extract the recipe

export const config = { maxDuration: 30 };

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

// CORS headers so the PWA and Shortcut can both talk to this
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key",
  "Content-Type": "application/json",
};

export default async function handler(req, res) {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).setHeaders(CORS).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Optional simple auth — set RECIPE_SECRET in Vercel env vars if you want
  const secret = process.env.RECIPE_SECRET;
  if (secret && req.headers["x-api-key"] !== secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { url, text } = req.body || {};
  if (!url && !text) {
    return res.status(400).json({ error: "Need url or text in body" });
  }

  try {
    let pageContent = text || "";

    // If a URL was provided, try to fetch the page content
    if (url) {
      try {
        const fetchRes = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
            "Accept": "text/html,application/xhtml+xml,*/*",
            "Accept-Language": "en-US,en;q=0.9",
          },
          signal: AbortSignal.timeout(8000),
        });
        const html = await fetchRes.text();
        // Extract visible text from HTML - strip tags, scripts, styles
        pageContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s{2,}/g, " ")
          .trim()
          .slice(0, 6000); // Keep first 6000 chars for Claude
      } catch (fetchErr) {
        // If fetch fails (TikTok blocks bots), use URL itself as context
        pageContent = `Could not fetch page content. URL: ${url}\nThis appears to be a social media post. Please generate a realistic recipe based on the URL context.`;
      }
    }

    // Build the Claude prompt
    const prompt = `You are extracting a recipe from web content. The user shared this from social media or a website.

URL: ${url || "not provided"}

PAGE CONTENT:
${pageContent}

Extract or generate a complete high-protein recipe suitable for the user's goals (240lb male, 22yo, recomp goal, 200g protein/day, 2400 cal/day). If you can't extract a specific recipe from the content, create a realistic one inspired by what the URL/content suggests.

Return ONLY valid JSON (no markdown fences, no explanation, just the raw JSON):
{
  "name": "Recipe Name",
  "time": "15 min",
  "cal": 520,
  "protein": 45,
  "carbs": 50,
  "fat": 12,
  "tags": ["High Protein", "Quick"],
  "ingredients": [
    {"item": "ingredient name", "qty": 1, "unit": "cup"}
  ],
  "instructions": [
    "Step 1 text",
    "Step 2 text"
  ],
  "tip": "One helpful cooking tip",
  "source_url": "${url || ""}"
}

Rules:
- Nutrition must be realistic for ONE serving
- Protein should be 30g+ per serving to match user's goals
- Keep instructions simple — user works 12hr night shifts
- Tags from: High Protein, Quick, Breakfast, Lunch, Dinner, Snack, Batch Cook, Shift OK, No Cook
- ONLY return the JSON object, nothing else`;

    // Call Claude
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const claudeData = await claudeRes.json();

    if (!claudeRes.ok) {
      throw new Error(`Claude API error: ${claudeData.error?.message || "Unknown"}`);
    }

    const rawText = claudeData.content?.[0]?.text || "";
    const clean = rawText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const recipe = JSON.parse(clean);

    // Add metadata
    recipe.id = `r${Date.now()}`;
    recipe.servings = 1;
    recipe.baseServings = 1;
    recipe.imported_from = url || "manual";
    recipe.imported_at = new Date().toISOString();

    return res.status(200).setHeaders(CORS).json({ success: true, recipe });

  } catch (err) {
    console.error("Extract error:", err);
    return res.status(500).setHeaders(CORS).json({
      error: "Failed to extract recipe",
      detail: err.message,
    });
  }
}
