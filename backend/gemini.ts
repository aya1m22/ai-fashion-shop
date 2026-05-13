import { ENV } from "./_core/env";

export interface SkinAnalysis {
  isValid: boolean;
  message: string;
  detectedGender: "men" | "women" | "unknown";
  skinTone: string;
  undertone: "warm" | "cool" | "neutral";
  bestColors: string[];
  accessoryMetal: "gold" | "silver" | "either";
  seasonalPalette: "Spring" | "Summer" | "Autumn" | "Winter";
}

const ANALYSIS_PROMPT = `You are a professional personal color analyst and fashion stylist.

Analyze this photo and determine:
1. Whether a person with clearly visible skin is present
2. Their skin tone (fair / light / medium / olive / tan / deep)
3. Their undertone (warm / cool / neutral) based on vein color, jaw line, and overall hue
4. Their apparent gender from visual cues (for clothing recommendations)
5. The 5 best clothing colors that flatter this skin tone and undertone
6. Whether gold or silver accessories suit them better
7. Their personal color season (Spring / Summer / Autumn / Winter)

Return ONLY valid JSON with this exact shape — no markdown, no extra text:
{
  "isValid": true,
  "message": "Analysis complete",
  "detectedGender": "women",
  "skinTone": "medium",
  "undertone": "warm",
  "bestColors": ["terracotta", "olive green", "warm beige", "rust", "camel"],
  "accessoryMetal": "gold",
  "seasonalPalette": "Autumn"
}

If no person with visible skin is detected, return:
{
  "isValid": false,
  "message": "Could not detect a person with visible skin in this photo.",
  "detectedGender": "unknown",
  "skinTone": "",
  "undertone": "neutral",
  "bestColors": [],
  "accessoryMetal": "either",
  "seasonalPalette": "Summer"
}`;

const VISION_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash-002",
];

async function callGeminiVision(
  apiKey: string,
  model: string,
  mimeType: string,
  base64Data: string,
): Promise<Response> {
  return fetch(
    `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: mimeType, data: base64Data } },
            { text: ANALYSIS_PROMPT },
          ],
        }],
        // No responseMimeType — not universally supported; we strip markdown below
        generationConfig: {
          maxOutputTokens: 512,
          temperature: 0.2,
        },
      }),
    },
  );
}

export async function analyzePhotoWithGemini(imageDataUrl: string): Promise<SkinAnalysis> {
  const apiKey = ENV.geminiApiKey;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Add GEMINI_API_KEY (or VITE_GEMINI_API_KEY) to .env");
  }

  const matches = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid image format — expected a base64 DataURL");
  const mimeType = matches[1];
  const base64Data = matches[2];

  let lastError = "";

  for (const model of VISION_MODELS) {
    // First attempt
    let response = await callGeminiVision(apiKey, model, mimeType, base64Data);

    // On 429, wait 3 s and retry once before trying the next model
    if (response.status === 429) {
      console.warn(`[Gemini] Rate limit on ${model} — retrying in 3 s`);
      await new Promise((r) => setTimeout(r, 3000));
      response = await callGeminiVision(apiKey, model, mimeType, base64Data);
    }

    if (response.status === 429) {
      console.warn(`[Gemini] Still rate-limited on ${model} — trying next model`);
      lastError = "rate_limit";
      continue;
    }

    // 404 = model not available for this API key; try the next one
    if (response.status === 404) {
      const errText = await response.text();
      console.warn(`[Gemini] ${model} not found (404) — trying next model. ${errText.slice(0, 120)}`);
      lastError = errText;
      continue;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errorText.slice(0, 300)}`);
    }

    const result = await response.json();
    const raw = result.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!raw) throw new Error("Gemini returned an empty response");

    // Strip optional markdown code fences the model sometimes adds
    const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

    try {
      return JSON.parse(text) as SkinAnalysis;
    } catch {
      throw new Error(`Gemini response was not valid JSON: ${text.slice(0, 200)}`);
    }
  }

  if (lastError === "rate_limit") {
    throw new Error("AI analysis is temporarily busy — please wait a moment and try again.");
  }
  throw new Error(`No available Gemini model found for this API key. Last error: ${lastError.slice(0, 200)}`);
}

const TEXT_MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash", "gemini-1.5-flash-latest"];

/** Text-only Gemini call — used for style recommendations and quiz results. */
export async function askGeminiText(prompt: string): Promise<string> {
  const apiKey = ENV.geminiApiKey;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
  });

  for (const model of TEXT_MODELS) {
    let response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body },
    );

    if (response.status === 429) {
      console.warn(`[Gemini] Rate limit on ${model} (text) — retrying in 3 s`);
      await new Promise((r) => setTimeout(r, 3000));
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body },
      );
    }

    if (response.status === 429) {
      console.warn(`[Gemini] Still rate-limited on ${model} (text) — trying next model`);
      continue;
    }

    if (response.status === 404) {
      console.warn(`[Gemini] ${model} not found (text) — trying next model`);
      continue;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errorText.slice(0, 200)}`);
    }

    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }

  console.warn("[Gemini] All text models rate-limited — returning empty");
  return "";
}
