const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export async function askGemini(prompt: string) {
  if (!GEMINI_API_KEY) {
    console.error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
    throw new Error("API_KEY_MISSING");
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No candidates returned from Gemini");
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export function parseGeminiJson(text: string) {
  try {
    // Remove markdown code blocks if present
    const cleanText = text.replace(/```json|```/gi, "").trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse Gemini JSON:", e, text);
    throw new Error("INVALID_JSON");
  }
}
