/**
 * index.js — WMT Junior Bot — Main Entry Point
 * Cloudflare Workers
 */

import { handleWebhook } from "./handlers/webhook.js";
import { handleScheduler } from "./handlers/scheduler.js";
import { handleAdmin } from "./handlers/admin.js";

// ── In-memory KB cache (1 hour TTL)
export const kbCache = {
  data: null,
  ts: 0,
  TTL: 60 * 60 * 1000, // 1 hour

  get() {
    if (this.data && Date.now() - this.ts < this.TTL) return this.data;
    return null;
  },

  set(data) {
    this.data = data;
    this.ts = Date.now();
  },

  reset() {
    this.data = null;
    this.ts = 0;
  },

  lastUpdated() {
    return this.ts ? new Date(this.ts).toISOString() : null;
  },
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/webhook" && request.method === "POST") {
      return handleWebhook(request, env);
    }

    if (path.startsWith("/admin") || path.startsWith("/api/")) {
      return handleAdmin(request, env);
    }

    if (path === "/health") {
      return new Response(JSON.stringify({ status: "ok", bot: "WMT Junior" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404 });
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleScheduler(env));
  },
};
