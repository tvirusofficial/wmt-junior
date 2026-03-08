/**
 * index.js — WMT Junior Bot — Main Entry Point
 * Cloudflare Workers
 */

import { handleWebhook } from "./handlers/webhook.js";
import { handleScheduler } from "./handlers/scheduler.js";
import { handleAdmin } from "./handlers/admin.js";

export default {
  // ── HTTP Requests
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ── Route: Telegram Webhook
    if (path === "/webhook" && request.method === "POST") {
      return handleWebhook(request, env);
    }

    // ── Route: Admin Panel + API
    if (path.startsWith("/admin") || path.startsWith("/api/")) {
      return handleAdmin(request, env);
    }

    // ── Route: Health check
    if (path === "/health") {
      return new Response(JSON.stringify({ status: "ok", bot: "WMT Junior" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── All other routes → 404
    return new Response("Not found", { status: 404 });
  },

  // ── Cron Trigger (every 5 minutes)
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleScheduler(env));
  },
};
