/**
 * admin.js — Admin Panel API Handler
 */

import { isValidAdminToken } from "../middleware/auth.js";
import { sendMessage } from "../services/telegram.js";
import {
  getAllChatLogs, saveChatLog,
  getAllKB, addKBEntry, updateKBEntry, deleteKBEntry,
  getAllSchedules, addSchedule, updateSchedule, deleteSchedule,
  getAllConfig, setConfig,
  getAllMessages, markMessageRead, markMessageSent, deleteMessage, saveMessage,
} from "../services/supabase.js";
import ADMIN_HTML from "../admin-html.js";
import { kbCache } from "../index.js";
import { invalidateCache } from "../services/gemini.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

function cors() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function handleAdmin(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === "OPTIONS") return cors();

  if (path === "/admin" || path === "/admin/") {
    return new Response(ADMIN_HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  // Voice file serve from R2 — needs token in URL query param
  if (path.startsWith("/api/voice/") && request.method === "GET") {
    const tokenParam = url.searchParams.get("t");
    if (!tokenParam || tokenParam !== env.ADMIN_SECRET_TOKEN) {
      return new Response("Unauthorized", { status: 401 });
    }
    const key = decodeURIComponent(path.replace("/api/voice/", ""));
    const obj = await env.VOICE_BUCKET.get(key);
    if (!obj) return new Response("Not found", { status: 404 });
    const headers = new Headers();
    headers.set("Content-Type", obj.httpMetadata?.contentType || "audio/ogg");
    headers.set("Cache-Control", "private, max-age=3600");
    return new Response(obj.body, { headers });
  }

  if (!isValidAdminToken(request, env)) return json({ error: "Unauthorized" }, 401);

  // Chat Logs
  if (path === "/api/chats" && request.method === "GET") {
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    return json(await getAllChatLogs(env, limit, offset));
  }

  // Knowledge Base
  if (path === "/api/kb") {
    if (request.method === "GET") return json(await getAllKB(env));
    if (request.method === "POST") {
      const body = await request.json();
      return json(await addKBEntry(env, body), 201);
    }
  }
  if (path.startsWith("/api/kb/")) {
    const id = path.split("/api/kb/")[1];
    if (request.method === "PATCH") return json(await updateKBEntry(env, id, await request.json()));
    if (request.method === "DELETE") { await deleteKBEntry(env, id); return json({ success: true }); }
  }

  // Schedules
  if (path === "/api/schedules") {
    if (request.method === "GET") return json(await getAllSchedules(env));
    if (request.method === "POST") {
      const body = await request.json();
      const userIds = env.ALLOWED_USER_IDS?.split(",").map(id => id.trim()).filter(Boolean) || [];
      await Promise.all(userIds.map(uid =>
        addSchedule(env, {
          targetUserId: uid,
          message: body.message,
          context: body.context,
          sendAt: body.send_at,
          recurrence: body.recurrence || "once",
        })
      ));
      return json({ success: true, sent_to: userIds.length }, 201);
    }
  }
  if (path.startsWith("/api/schedules/")) {
    const id = path.split("/api/schedules/")[1];
    if (request.method === "PATCH") {
      const body = await request.json();
      return json(await updateSchedule(env, id, {
        message: body.message,
        context: body.context,
        sendAt: body.send_at,
        recurrence: body.recurrence,
      }));
    }
    if (request.method === "DELETE") { await deleteSchedule(env, id); return json({ success: true }); }
  }

  // Config
  if (path === "/api/config") {
    if (request.method === "GET") return json(await getAllConfig(env));
    if (request.method === "PATCH") {
      const body = await request.json();
      await setConfig(env, body.key, body.value);
      return json({ success: true });
    }
  }

  // Webhook setup
  if (path === "/api/setup-webhook" && request.method === "POST") {
    const workerUrl = `https://${url.hostname}/webhook`;
    const { setWebhook } = await import("../services/telegram.js");
    return json(await setWebhook(env, workerUrl));
  }

  // Cache status + reset
  if (path === "/api/cache" && request.method === "GET") {
    return json({
      cached: kbCache.get() !== null,
      entries: kbCache.data?.length || 0,
      lastUpdated: kbCache.lastUpdated(),
      ttlMinutes: 60,
    });
  }
  if (path === "/api/cache/reset" && request.method === "POST") {
    kbCache.reset();
    invalidateCache();
    // Also clear from Supabase
    await fetch(`${env.SUPABASE_URL}/rest/v1/wmt_gemini_cache?id=eq.1`, {
      method: "DELETE",
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      },
    });
    return json({ success: true, message: "KB + Gemini cache cleared" });
  }

  // ── Bridge Messages
  if (path === "/api/messages" && request.method === "GET") {
    return json(await getAllMessages(env));
  }

  if (path === "/api/messages/read" && request.method === "POST") {
    const { id } = await request.json();
    await markMessageRead(env, id);
    return json({ success: true });
  }

  if (path === "/api/messages/reply" && request.method === "POST") {
    const { content } = await request.json();
    if (!content) return json({ error: "content required" }, 400);
    // Wrap message naturally as bot speaking for WMT
    const wrapped = `မမရေ၊ ဆရာက "${content}" လို့ ပြောလိုက်တယ်`;
    // Send to မမ via Telegram
    const userIds = (env.ALLOWED_USER_IDS || "").split(",").map(s => s.trim()).filter(Boolean);
    for (const uid of userIds) {
      await sendMessage(env, uid, wrapped);
      await saveChatLog(env, { userId: uid, role: "assistant", message: wrapped });
    }
    await saveMessage(env, { direction: "to_user", content });
    return json({ success: true });
  }

  if (path.startsWith("/api/messages/") && request.method === "DELETE") {
    const id = path.split("/").pop();
    await deleteMessage(env, id);
    return json({ success: true });
  }

  return json({ error: "Not found" }, 404);
}
