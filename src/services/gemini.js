/**
 * gemini.js — Gemini 2.5 Flash AI Service
 * With server-side Context Caching
 */

const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const CACHE_API = "https://generativelanguage.googleapis.com/v1beta/cachedContents";
const TTL_SECONDS = 3600; // 1 hour

// ── Cache helpers (Supabase)
async function loadCacheFromDB(env) {
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/wmt_gemini_cache?id=eq.1&limit=1`,
    {
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      },
    }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  if (!rows.length) return null;
  const row = rows[0];
  const age = Date.now() - new Date(row.created_at).getTime();
  if (age > TTL_SECONDS * 1000) return null; // expired
  return row.cache_name;
}

async function saveCacheToDB(env, cacheName) {
  // Upsert single row id=1
  await fetch(`${env.SUPABASE_URL}/rest/v1/wmt_gemini_cache?id=eq.1`, {
    method: "DELETE",
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    },
  });
  await fetch(`${env.SUPABASE_URL}/rest/v1/wmt_gemini_cache`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify({ id: 1, cache_name: cacheName }),
  });
}

async function deleteGeminiCache(env, cacheName) {
  await fetch(`https://generativelanguage.googleapis.com/v1beta/${cacheName}?key=${env.GEMINI_API_KEY}`, {
    method: "DELETE",
  });
}

async function createCache(env, systemPrompt) {
  const res = await fetch(`${CACHE_API}?key=${env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "models/gemini-2.5-flash",
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: "init" }] }, { role: "model", parts: [{ text: "ready" }] }],
      ttl: `${TTL_SECONDS}s`,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("Cache create error:", err);
    return null;
  }
  const data = await res.json();
  return data.name || null;
}

// In-memory cache name (fast path)
let memCacheName = null;
let memCacheTs = 0;

export async function getOrCreateCache(env, systemPrompt) {
  // 1. Check memory
  if (memCacheName && Date.now() - memCacheTs < TTL_SECONDS * 1000) {
    return memCacheName;
  }

  // 2. Check Supabase
  const dbCache = await loadCacheFromDB(env);
  if (dbCache) {
    memCacheName = dbCache;
    memCacheTs = Date.now();
    return dbCache;
  }

  // 3. Create new cache
  console.log("Creating new Gemini context cache...");
  const cacheName = await createCache(env, systemPrompt);
  if (!cacheName) return null;

  memCacheName = cacheName;
  memCacheTs = Date.now();
  await saveCacheToDB(env, cacheName);
  console.log("Cache created:", cacheName);
  return cacheName;
}

export function invalidateCache() {
  memCacheName = null;
  memCacheTs = 0;
}

// ── Generate reply (with context cache)
export async function generateReply(env, systemPrompt, chatHistory) {
  const contents = chatHistory.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  // Try with cache first
  const cacheName = await getOrCreateCache(env, systemPrompt);

  let body;
  if (cacheName) {
    // Use cached context — no system_instruction needed
    body = {
      cachedContent: cacheName,
      contents,
      generationConfig: { temperature: 1.0, maxOutputTokens: 2048, topP: 0.95 },
    };
  } else {
    // Fallback — no cache
    body = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { temperature: 1.0, maxOutputTokens: 2048, topP: 0.95 },
    };
  }

  const res = await fetch(`${GEMINI_API}?key=${env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Gemini error:", err);
    // If cache expired/invalid, invalidate and retry without cache
    if (err.includes("cachedContent") || err.includes("INVALID")) {
      invalidateCache();
    }
    throw new Error("Gemini API failed");
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text;
  const finishReason = candidate?.finishReason;
  console.log("Gemini finishReason:", finishReason, "| cached:", !!cacheName);

  if (!text) {
    console.error("Empty response:", JSON.stringify(data));
    return "အင်း... နည်းနည်း ကြာသွားတယ်။ ထပ်ပြောပါ 😅";
  }
  if (finishReason === "MAX_TOKENS") return text + "...";
  return text;
}

// ── Voice reply (cache မသုံးနိုင် — audio input ပါလို့)
export async function generateReplyFromVoice(env, systemPrompt, chatHistory, audioBase64, mimeType = "audio/ogg") {
  const contents = chatHistory.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  contents.push({
    role: "user",
    parts: [
      { inline_data: { mime_type: mimeType, data: audioBase64 } },
      { text: "မမ voice message ပို့လာတယ်။ audio ထဲမှာ ဘာပြောသလဲ နားထောင်ပြီး ပုံမှန်အတိုင်း မမ့်ကို ဖြေပေး။" },
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
