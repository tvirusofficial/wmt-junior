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

// Detect if user message should be flagged for admin
export async function detectAdminFlag(env, userMessage) {
  const prompt = `သင်သည် message classifier ဖြစ်သည်။

အောက်ပါ message တွင် အောက်ပါ အကြောင်းအရာ တစ်ခုခု ပါ/မပါ စစ်ဆေးပါ —
1. ကောင်မလေးက ဆရာ (ဝင်းမြင့်ထွန်း) ကို တစ်ခုခု ပြောပေးစေချင်/ပြောပေးဆိုလိုင်ဆိုတာ
2. ဆရာ့ကို message တစ်ခုခု ပို့ပေးစေချင်တာ
3. ဆရာ့ကို သိစေချင်တဲ့ အချက်အလက် တစ်ခုခု

ဥပမာ — "ဆရာ့ကို ပြောပေး", "ဆရာ သိစေချင်တယ်", "ဆရာ့ကို မပြောနဲ့", "ဆရာ့ဆီ ပို့ပေး"

JSON format ဖြင့်သာ ဖြေပါ၊ တခြားဘာမှ မထည့်ရ —
{"flagged": true/false, "reason": "short reason or null"}

Message: "${userMessage.replace(/"/g, '\\"')}"`;

  try {
    const res = await fetch(`${GEMINI_API}?key=${env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 100 },
      }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return parsed.flagged === true ? (parsed.reason || true) : false;
  } catch (e) {
    console.error("detectAdminFlag error:", e);
    return false;
  }
}
