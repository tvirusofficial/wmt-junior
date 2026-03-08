# WMT Junior Bot 🤖

WMT Digital ကိုယ်ပွား — Lovely & Funny Telegram Bot

## Tech Stack
- **AI**: Gemini 2.5 Flash
- **Backend**: Cloudflare Workers
- **Database**: Supabase (PostgreSQL)
- **Interface**: Telegram Bot

## Project Structure

```
src/
├── index.js                 # Main entry point
├── system-prompt.js         # AI personality builder
├── handlers/
│   ├── webhook.js           # Telegram webhook handler
│   ├── scheduler.js         # Cron job handler
│   └── admin.js             # Admin panel API
├── services/
│   ├── gemini.js            # Gemini AI service
│   ├── telegram.js          # Telegram Bot API
│   └── supabase.js          # Database queries
└── middleware/
    └── auth.js              # Security / whitelist
```

## Setup

### 1. Cloudflare Secrets (wrangler secret put)

```bash
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put TELEGRAM_WEBHOOK_SECRET
wrangler secret put GEMINI_API_KEY
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_KEY
wrangler secret put ALLOWED_USER_IDS
wrangler secret put ADMIN_ID
wrangler secret put ADMIN_SECRET_TOKEN
```

### 2. Deploy

```bash
npm run deploy
```

### 3. Set Webhook

Deploy ပြီးရင် Admin Panel → Setup Webhook နှိပ်ပါ သို့မဟုတ်:

```
POST https://your-worker.workers.dev/api/setup-webhook
Authorization: Bearer YOUR_ADMIN_SECRET_TOKEN
```

## Security

- Telegram ID whitelist — 2 users only
- Webhook secret token validation
- Supabase RLS — service key only
- Admin panel bearer token auth
