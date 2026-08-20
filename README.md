# Depthly Creator Outreach

Phase 1 internal creator discovery and outreach CRM. The React client searches through an authenticated Supabase Edge Function, scores normalized YouTube creator data, and explicitly imports useful candidates into an RLS-protected CRM.

## Local setup

Requirements: Node.js 20+, a Supabase project, Supabase CLI, and a Google Cloud project with YouTube Data API v3 enabled.

```powershell
npm install
Copy-Item .env.example .env.local
```

Fill in `.env.local`:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

Link the Supabase project, apply the migration, set the server-only YouTube secret, and deploy the function:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
npx supabase secrets set YOUTUBE_API_KEY=YOUR_KEY
npx supabase functions deploy youtube-creator-search
```

In Supabase Authentication:

1. Create or invite each internal user.
2. Keep public account creation disabled for this internal tool.
3. Add `http://localhost:5173/discovery` and the production `/discovery` URL to allowed redirect URLs.

Then run:

```powershell
npm run dev
```

## Validation

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

The real `study with me` acceptance flow requires deployed Supabase resources, an invited user, and a valid YouTube API key. YouTube live metrics remain the source of truth; Supabase persists qualification and CRM data only.

## Architecture

```text
React client
  ├─ Supabase Auth (invited users, email magic link)
  ├─ Supabase tables (RLS-scoped CRM reads/writes)
  └─ Authenticated Edge Function
       └─ YouTube Data API v3
```

Only `creators` and `creator_videos` are included. Outreach automation, scraping, partnerships, conversions, payouts, and background refresh jobs are intentionally outside Phase 1.
