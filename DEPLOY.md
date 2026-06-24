# Deploy to Vercel

## Option 1: One-click from GitHub

1. Go to https://vercel.com/new
2. Import `tmk202/spy-yt` repo
3. Vercel auto-detects Next.js
4. Add env vars:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://faledmchqtdlabxeuatv.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (anon key)
5. Click Deploy

## Option 2: Vercel CLI

```bash
cd /Users/alice/Documents/nnt/CODE/spy-yt-web
npx vercel login
npx vercel --prod
```

## Done!

Site will be live at: `https://spy-yt-<hash>.vercel.app`
