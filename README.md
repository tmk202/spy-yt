# spy-yt — static dashboard (Vercel)

Static frontend cho [spy-yt](https://github.com/tmk202/spy-yt) — đọc dữ liệu từ **Supabase Postgres** qua PostgREST.

## Kiến trúc

```
┌─────────────────┐         ┌──────────────────┐
│  Railway worker │ ─push─→ │  Supabase        │
│  (crawler 24/7) │  6h     │  Storage (truth) │
└─────────────────┘         │  + Postgres      │
                            │    (mirror)      │
                            └────────┬─────────┘
                                     │ HTTP (anon key)
                                     ↓
                            ┌──────────────────┐
                            │  Vercel static   │
                            │  (this site)     │
                            └──────────────────┘
```

## Stack

- **Next.js 14** (App Router, static export)
- **React 18** + **Tailwind CSS**
- **@supabase/supabase-js** (PostgREST client)

## Setup

```bash
# Install
npm install

# Env
cp .env.local.example .env.local
# Edit NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY

# Dev
npm run dev          # http://localhost:3000

# Build static
npm run build        # → ./out
```

## Supabase RLS (Required!)

Public read-only access cần policy. Run trong SQL editor:

```sql
-- Allow public SELECT on all tables
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE discoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read" ON channels FOR SELECT USING (true);
CREATE POLICY "public read" ON channel_snapshots FOR SELECT USING (true);
CREATE POLICY "public read" ON discoveries FOR SELECT USING (true);
CREATE POLICY "public read" ON crawl_runs FOR SELECT USING (true);
```

## Deploy to Vercel

```bash
# 1. Push to GitHub
git remote add origin https://github.com/tmk202/spy-yt-web.git
git branch -M main
git push -u origin main

# 2. Vercel auto-detect Next.js
# 3. Set env vars in Vercel dashboard:
#    NEXT_PUBLIC_SUPABASE_URL
#    NEXT_PUBLIC_SUPABASE_ANON_KEY

# CLI alternative:
vercel --prod
```

## Pages

- `/` — channels list với filter (search, country, niche, subs range)
- `/channel/[id]` — channel detail (history, discoveries, stats)
- `/runs` — crawl runs grouped by date

## Data source

Project ID: `faledmchqtdlabxeuatv`  
Tables: `channels`, `channel_snapshots`, `discoveries`, `crawl_runs`  
Last sync: ~1.4k+ rows, 792 unique channels

## License

MIT — by @mocnguyenvn
