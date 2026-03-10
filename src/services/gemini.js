/**
 * gemini.js — Gemini 2.5 Flash AI Service
 */

const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function generateReply(env, systemPrompt, chatHistory) {
  const contents = chatHistory.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const res = await fetch(`${GEMINI_API}?key=${env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { temperature: 1.0, maxOutputTokens: 2048, topP: 0.95 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Gemini error:", err);
    throw new Error("Gemini API failed");
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text;
  const finishReason = candidate?.finishReason;
  console.log("Gemini finishReason:", finishReason);

  if (!text) {
    console.error("Empty response:", JSON.stringify(data));
    return "အင်း... နည်းနည်း ကြာသွားတယ်။ ထပ်ပြောပါ 😅";
  }
  if (finishReason === "MAX_TOKENS") {
    console.warn("Response was cut off by MAX_TOKENS");
    return text + "...";
  }
  return text;
}

// Handle voice message — transcribe + reply in one Gemini call
export async function generateReplyFromVoice(env, systemPrompt, chatHistory, audioBase64, mimeType = "audio/ogg") {
  const contents = chatHistory.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  // Add voice as the latest user message
  contents.push({
    role: "user",
    parts: [
      {
        inline_data: {
          mime_type: mimeType,
          data: audioBase64,
        },
      },
      {
        text: "မမ voice message ပို့လာတယ်။ audio ထဲမှာ ဘာပြောသလဲ နားထောင်ပြီး ပုံမှန်အတိုင်း မမ့်ကို ဖြေပေး။",
      },
    ],
  });

  const res = await fetch(`${GEMINI_API}?key=${env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { temperature: 1.0, maxOutputTokens: 2048, topP: 0.95 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Gemini voice error:", err);
    throw new Error("Gemini voice API failed");
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return "အင်း... voice message ကြားရတာ မရှင်းဘူး၊ ထပ်ပြောပေးနော် 😅";
  return text;
}
