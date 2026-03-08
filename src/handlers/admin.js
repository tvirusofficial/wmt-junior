/**
 * admin.js — Admin Panel API Handler
 */

import { isValidAdminToken } from "../middleware/auth.js";
import {
  getAllChatLogs,
  getAllKB, addKBEntry, updateKBEntry, deleteKBEntry,
  getAllSchedules, addSchedule, deleteSchedule,
  getAllConfig, setConfig,
} from "../services/supabase.js";
import ADMIN_HTML from "../admin-html.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
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

  // CORS preflight
  if (request.method === "OPTIONS") return cors();

  // Serve Admin Panel HTML
  if (path === "/admin" || path === "/admin/") {
    return new Response(ADMIN_HTML, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Auth check for all /api/* routes
  if (!isValidAdminToken(request, env)) {
    return json({ error: "Unauthorized" }, 401);
  }

  // Chat Logs
  if (path === "/api/chats" && request.method === "GET") {
    const logs = await getAllChatLogs(env, 200);
    return json(logs);
  }

  // Knowledge Base
  if (path === "/api/kb") {
    if (request.method === "GET") return json(await getAllKB(env));
    if (request.method === "POST") {
      const body = await request.json();
      const entry = await addKBEntry(env, body);
      return json(entry, 201);
    }
  }

  if (path.startsWith("/api/kb/")) {
    const id = path.split("/api/kb/")[1];
    if (request.method === "PATCH") {
      const body = await request.json();
      const entry = await updateKBEntry(env, id, body);
      return json(entry);
    }
    if (request.method === "DELETE") {
      await deleteKBEntry(env, id);
      return json({ success: true });
    }
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
        })
      ));
      return json({ success: true, sent_to: userIds.length }, 201);
    }
  }

  if (path.startsWith("/api/schedules/")) {
    const id = path.split("/api/schedules/")[1];
    if (request.method === "DELETE") {
      await deleteSchedule(env, id);
      return json({ success: true });
    }
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
    const result = await setWebhook(env, workerUrl);
    return json(result);
  }

  return json({ error: "Not found" }, 404);
}
