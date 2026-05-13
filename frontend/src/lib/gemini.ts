export async function askGemini(prompt: string) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "your_actual_key_here") {
    console.error("No API key found");
    return "AI features unavailable — API key missing. Please add your key to the .env file.";
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            temperature: 0.7, 
            maxOutputTokens: 500 
          }
        })
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        console.warn("[Gemini] Rate limit hit — returning fallback");
        return "Our AI stylist is taking a short break. Try again in a few seconds!";
      }
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API Error Response:", errorData);
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
