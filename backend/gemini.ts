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

export async function analyzePhotoWithGemini(imageDataUrl: string): Promise<SkinAnalysis> {
  const apiKey = ENV.geminiApiKey;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Add GEMINI_API_KEY (or VITE_GEMINI_API_KEY) to .env");
  }

  const matches = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid image format — expected a base64 DataURL");
  const mimeType = matches[1];
  const base64Data = matches[2];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 512,
          temperature: 0.2,
        },
      }),
    },
  );

  if (!response.ok) {
    if (response.status === 429) {
      console.warn("[Gemini] Rate limit (429) — returning fallback analysis");
      return {
        isValid: false,
        message: "AI analysis temporarily unavailable — rate limit reached. Please try again in a moment.",
        detectedGender: "unknown" as const,
        skinTone: "",
        undertone: "neutral" as const,
        bestColors: ["navy", "white", "grey", "black", "beige"],
        accessoryMetal: "either" as const,
        seasonalPalette: "Summer" as const,
      };
    }
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText.slice(0, 300)}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned an empty response");

  try {
    return JSON.parse(text) as SkinAnalysis;
  } catch {
    throw new Error(`Gemini response was not valid JSON: ${text.slice(0, 200)}`);
  }
}

/** Text-only Gemini call — used for style recommendations and quiz results. */
export async function askGeminiText(prompt: string): Promise<string> {
  const apiKey = ENV.geminiApiKey;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
      }),
    },
  );

  if (!response.ok) {
    if (response.status === 429) {
      console.warn("[Gemini] Rate limit (429) on text call — returning null");
      return "";
    }
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const result = await response.json();
  return result.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}
