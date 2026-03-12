/**
 * webhook.js — Telegram Webhook Handler
 */

import { isAllowedUser, isValidWebhookSecret } from "../middleware/auth.js";
import { extractMessage, sendMessage, sendTyping, getFileUrl, downloadFileAsBase64 } from "../services/telegram.js";
import { getRecentSessionHistory, saveChatLog, getAllKB, saveMessage } from "../services/supabase.js";
import { kbCache } from "../index.js";
import { generateReply, generateReplyFromVoice, invalidateCache } from "../services/gemini.js";
import { buildSystemPrompt } from "../system-prompt.js";

export async function handleWebhook(request, env) {
  if (!isValidWebhookSecret(request, env)) {
    console.warn("Invalid webhook secret");
    return new Response("OK", { status: 200 });
  }

  const update = await request.json();
  const msg = extractMessage(update);

  if (!msg) return new Response("OK", { status: 200 });

  const { userId, chatId, text, voice } = msg;

  if (!text && !voice) return new Response("OK", { status: 200 });

  if (!isAllowedUser(userId, env)) {
    console.warn(`Unauthorized access attempt from user: ${userId}`);
    return new Response("OK", { status: 200 });
  }

  await sendTyping(env, chatId);

  try {
    // Use cached KB if available (1 hour TTL)
    let kbEntries = kbCache.get();
    if (!kbEntries) {
      kbEntries = await getAllKB(env);
      kbCache.set(kbEntries);
    }
    const chatHistory = await getRecentSessionHistory(env, userId, 20);

    const systemPrompt = buildSystemPrompt(kbEntries);
    let reply;
    let savedText;
    let voiceUrl = null;

    if (voice) {
      // Download audio
      const fileUrl = await getFileUrl(env, voice.file_id);
      if (!fileUrl) throw new Error("Could not get voice file URL");

      const audioBase64 = await downloadFileAsBase64(fileUrl);
      if (!audioBase64) throw new Error("Could not download voice file");

      // Save to R2
      if (env.VOICE_BUCKET) {
        const key = `voices/${userId}/${Date.now()}.ogg`;
        const audioBytes = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
        await env.VOICE_BUCKET.put(key, audioBytes, {
          httpMetadata: { contentType: voice.mime_type || "audio/ogg" },
        });
        voiceUrl = key; // Store R2 key
      }

      // Pass full history for context, but Gemini rules prevent verbatim repetition
      reply = await generateReplyFromVoice(env, systemPrompt, chatHistory, audioBase64, voice.mime_type || "audio/ogg");
      savedText = "[🎤 Voice message]";

    } else {
      // Text message flow
      const messages = [...chatHistory, { role: "user", content: text }];
      reply = await generateReply(env, systemPrompt, messages);
      savedText = text;
    }

    await Promise.all([
      saveChatLog(env, { userId, role: "user", message: savedText, voiceUrl }),
      saveChatLog(env, { userId, role: "assistant", message: reply }),
    ]);

    // Bridge: detect if မမ wants to send message to admin
    if (text && isBridgeRequest(text)) {
      const extracted = extractBridgeContent(text);
      if (extracted) {
        const wrapped = `ဆရာရေ၊ မမက ဆရာ့ကို "${extracted}" လို့ ပြောပေးခိုင်းလိုက်လို့ပါ 💌`;
        await saveMessage(env, { direction: "to_admin", content: wrapped });
        console.log("Bridge message saved:", wrapped);
      }
    }

    await sendMessage(env, chatId, reply);

  } catch (err) {
    console.error("Webhook handler error:", err);
    await sendMessage(env, chatId, "အင်း... တစ်ခုခု ဖြစ်သွားတယ်။ နည်းနည်းနေပြီး ပြန်ပြော 😅");
  }

  return new Response("OK", { status: 200 });
}

// ── Bridge detection helpers
const BRIDGE_TARGETS = ["နင့်ဆရာ", "ဦးဝင်းမြင့်ထွန်း", "ကိုကြီး", "ကိုကို", "ဆရာ", "သူ"];
const BRIDGE_ACTIONS = ["ပြောပေး", "သွားပြောပေး", "ဆချပေး", "သိစေပေး", "ပြောလိုက်"];
// All possible "ကို" suffixes per target
const BRIDGE_KIO = ["ကို", "့ကို", "ကိုသွား", "့ကိုသွား"];

function isBridgeRequest(text) {
  const t = text.replace(/\s+/g, "");
  // 1. Target + kio + action pattern
  const hasTargetPattern = BRIDGE_TARGETS.some(target =>
    BRIDGE_ACTIONS.some(action =>
      BRIDGE_KIO.some(kio => t.includes((target + kio + action).replace(/\s+/g, "")))
    )
  );
  if (hasTargetPattern) return true;
  // 2. Standalone "သွားပြောပေး" or "ပြောပေးဦး" — implicit bridge
  const standalone = ["သွားပြောပေး", "သွားပြောပေးဦး", "သွားပြောလိုက်"];
  return standalone.some(kw => t.includes(kw));
}

function extractBridgeContent(text) {
  // Sort targets longest first to avoid "ဆရာ" matching inside "နင့်ဆရာ"
  const sorted = [...BRIDGE_TARGETS].sort((a, b) => b.length - a.length);
  for (const target of sorted) {
    const idx = text.indexOf(target);
    if (idx > 0) {
      // Content before the target keyword
      const before = text.slice(0, idx).replace(/လို့\s*$|ဆိုပြီး\s*$|\s*$/, "").trim();
      if (before) return before;
    }
  }
  // Fallback: content after action keyword
  for (const act of BRIDGE_ACTIONS) {
    const actIdx = text.indexOf(act);
    if (actIdx !== -1) {
      const after = text.slice(actIdx + act.length).trim();
      if (after) return after;
    }
  }
  return text.trim();
}
