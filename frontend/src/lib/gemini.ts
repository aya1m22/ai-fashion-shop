const TEXT_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
];

export async function askGemini(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_actual_key_here") {
    console.error("[Gemini] No API key configured");
    return "AI features unavailable — API key missing. Please add VITE_GEMINI_API_KEY to your .env file.";
  }

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
  });

  for (const model of TEXT_MODELS) {
    let response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body },
    );

    // Rate limited — wait 3 s and retry once
    if (response.status === 429) {
      console.warn(`[Gemini] Rate limit on ${model} — retrying in 3 s`);
      await new Promise((r) => setTimeout(r, 3000));
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body },
      );
    }

    if (response.status === 429) {
      console.warn(`[Gemini] Still rate-limited on ${model} — trying next`);
      continue;
    }

    // Model not available for this key — try next
    if (response.status === 404) {
      console.warn(`[Gemini] ${model} not found — trying next`);
      continue;
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error(`[Gemini] ${model} error ${response.status}:`, err);
      continue;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (text) return text;
  }

  console.warn("[Gemini] All models failed — returning fallback");
  return "Our AI stylist is taking a short break. Try again in a few seconds!";
}

export function parseGeminiJson(text: string): any {
  try {
    const clean = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error("[Gemini] Failed to parse JSON:", e, text);
    throw new Error("INVALID_JSON");
  }
}
