import { ENV } from "./_core/env";

export interface SkinAnalysis {
  isValid: boolean;
  message: string;
  detectedGender: "men" | "women" | "unknown";
  skinTone: string;
  undertone: "warm" | "cool" | "neutral";
  bestColors: { name: string; hex: string }[];
  accessoryMetal: "gold" | "silver" | "either";
  seasonalPalette: "Spring" | "Summer" | "Autumn" | "Winter";
  tip?: string;
}

const ANALYSIS_PROMPT = `You are a professional color analyst. Analyze this person's skin tone from the photo.
Determine their apparent gender from visual cues.
Return ONLY a valid JSON object — no markdown, no explanation:
{
  "isValid": true,
  "detectedGender": "women",
  "skinTone": "medium",
  "undertone": "warm",
  "season": "Autumn",
  "bestColors": [
    {"name": "terracotta", "hex": "#c65d3a"},
    {"name": "olive green", "hex": "#6b7c3f"},
    {"name": "warm beige", "hex": "#d4b896"},
    {"name": "rust", "hex": "#b7410e"},
    {"name": "camel", "hex": "#c19a6b"}
  ],
  "jewelry": "gold",
  "tip": "one sentence style tip for this person"
}

If no person with visible skin is detected, return:
{
  "isValid": false,
  "detectedGender": "unknown",
  "skinTone": "",
  "undertone": "neutral",
  "season": "Summer",
  "bestColors": [],
  "jewelry": "either",
  "tip": ""
}`;

// ── Dynamic model discovery ────────────────────────────────────────────────────
// Preferred model name fragments in priority order (flash = fast + cheap)
const MODEL_PRIORITY = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.5-pro",
  "gemini-1.5-flash",
  "gemini-2.0-pro",
  "gemini-1.5-pro",
  "gemini-pro",
];

let _cachedModels: string[] | null = null;

async function discoverModels(apiKey: string): Promise<string[]> {
  if (_cachedModels) return _cachedModels;

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}&pageSize=100`,
    );
    if (!r.ok) {
      console.warn(`[Gemini] ListModels failed (${r.status}) — using hardcoded fallback list`);
      return MODEL_PRIORITY;
    }
    const data = await r.json();
    const all: string[] = (data.models ?? [])
      .filter((m: any) => (m.supportedGenerationMethods ?? []).includes("generateContent"))
      .map((m: any) => (m.name as string).replace("models/", ""));

    if (all.length === 0) {
      console.warn("[Gemini] ListModels returned no generateContent models — using hardcoded list");
      return MODEL_PRIORITY;
    }

    // Sort by priority: preferred fragments first, everything else appended
    const sorted: string[] = [];
    for (const prefix of MODEL_PRIORITY) {
      const match = all.find(n => n.startsWith(prefix) || n.includes(prefix));
      if (match && !sorted.includes(match)) sorted.push(match);
    }
    for (const m of all) {
      if (!sorted.includes(m)) sorted.push(m);
    }

    console.log("[Gemini] Available models:", sorted.join(", "));
    _cachedModels = sorted;
    return sorted;
  } catch (err) {
    console.warn("[Gemini] Could not fetch model list:", err);
    return MODEL_PRIORITY;
  }
}

// ── Vision call ────────────────────────────────────────────────────────────────
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
        generationConfig: { maxOutputTokens: 1024, temperature: 0.2 },
      }),
    },
  );
}

export async function analyzePhotoWithGemini(imageDataUrl: string): Promise<SkinAnalysis> {
  const apiKey = ENV.geminiApiKey;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Add GEMINI_API_KEY to .env");
  }

  const matches = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid image format — expected a base64 DataURL");
  const mimeType = matches[1];
  const base64Data = matches[2];

  const models = await discoverModels(apiKey);
  let lastError = "";

  for (const model of models) {
    let response = await callGeminiVision(apiKey, model, mimeType, base64Data);

    if (response.status === 429) {
      console.warn(`[Gemini] Rate limit on ${model} — retrying in 3 s`);
      await new Promise((r) => setTimeout(r, 3000));
      response = await callGeminiVision(apiKey, model, mimeType, base64Data);
    }
    if (response.status === 429) {
      lastError = "rate_limit";
      continue;
    }
    if (response.status === 404) {
      const t = await response.text();
      console.warn(`[Gemini] ${model} 404 — skipping`);
      lastError = t;
      continue;
    }
    if (!response.ok) {
      const t = await response.text();
      // Non-retryable error — surface it immediately
      throw new Error(`Gemini API error ${response.status}: ${t.slice(0, 300)}`);
    }

    const result = await response.json();
    const raw = result.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!raw) throw new Error("Gemini returned an empty response");

    const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    try {
      const parsed = JSON.parse(clean) as any;
      return {
        isValid: parsed.isValid ?? true,
        message: parsed.message ?? (parsed.isValid === false ? "Photo not suitable" : "Analysis complete"),
        detectedGender: parsed.detectedGender ?? "unknown",
        skinTone: parsed.skinTone ?? "",
        undertone: parsed.undertone ?? "neutral",
        bestColors: Array.isArray(parsed.bestColors) ? parsed.bestColors : [],
        accessoryMetal: parsed.jewelry ?? parsed.accessoryMetal ?? "either",
        seasonalPalette: parsed.season ?? parsed.seasonalPalette ?? "Summer",
        tip: parsed.tip ?? "",
      } as SkinAnalysis;
    } catch {
      throw new Error(`Gemini response was not valid JSON: ${clean.slice(0, 200)}`);
    }
  }

  if (lastError === "rate_limit") {
    throw new Error("AI analysis is temporarily busy — please wait a moment and try again.");
  }
  throw new Error("No Gemini model could handle the request. Check your API key at aistudio.google.com/apikey");
}

// ── Text call ──────────────────────────────────────────────────────────────────
export async function askGeminiText(prompt: string): Promise<string> {
  const apiKey = ENV.geminiApiKey;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const models = await discoverModels(apiKey);
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
  });

  for (const model of models) {
    let response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body },
    );

    if (response.status === 429) {
      await new Promise((r) => setTimeout(r, 3000));
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body },
      );
    }
    if (response.status === 429 || response.status === 404) continue;
    if (!response.ok) continue;

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (text) return text;
  }

  console.warn("[Gemini] All models failed for text call");
  return "";
}
