# Codex Prompt — Build Depthly Creator Outreach MVP

You are building an internal web application called **Depthly Creator Outreach**.

Before writing code, read these two specification files in full and treat them as the source of truth:

1. `DEPTHLY_CREATOR_OUTREACH_SUPABASE_SCHEMA.md`
2. `DEPTHLY_CREATOR_OUTREACH_REACT_UI.md`

Do not invent a different product direction. The goal of this app is to help Depthly discover relevant YouTube creators, evaluate them, shortlist them, manually add public business contact information, and track outreach status.

---

## 1. Goal of This First Implementation

Build **Phase 1 — Core MVP only**.

Do **not** implement partnerships, affiliate payouts, creator conversions, revenue dashboards, or advanced outreach automation yet.

The MVP must support this workflow:

```text
Search YouTube
→ fetch relevant videos/channels
→ resolve unique creators/channels
→ fetch useful channel statistics
→ fetch a small sample of recent videos
→ calculate creator scores
→ display/filter/sort creators
→ inspect a creator in a drawer
→ save useful creator data to Supabase
→ shortlist a creator
→ manually add business contact information
→ change creator status
→ add internal notes
```

The product goal is not to replicate YouTube data.

YouTube remains the source of truth for live YouTube statistics.

Supabase stores only useful CRM/qualification data.

---

# 2. Technology

Use:

```text
React
TypeScript
Vite
Tailwind CSS
Supabase
Supabase Edge Functions
YouTube Data API v3
TanStack Query
React Router
Lucide React
```

Use shadcn/ui components where they make implementation cleaner, especially for:

```text
Button
Input
Select
Sheet / Drawer
Badge
Tooltip
Dropdown Menu
Skeleton
Dialog when needed
```

Do not add unnecessary dependencies.

Keep the architecture simple and maintainable.

---

# 3. Security Requirement

The YouTube API key must **never** be exposed in the React client.

Do not use:

```text
VITE_YOUTUBE_API_KEY
```

or any other client-exposed environment variable for the YouTube key.

Store the key as a Supabase Edge Function secret.

The React application should call Supabase Edge Functions, and the Edge Function should call YouTube.

Architecture:

```text
React
   ↓
Supabase Edge Function
   ↓
YouTube Data API v3
```

The Edge Function should return only the normalized data the frontend actually needs.

---

# 4. Supabase MVP Schema

For this first phase implement only:

```text
creators
creator_videos
```

Do not create these yet:

```text
creator_partnerships
creator_conversions
creator_outreach
```

Those belong to later phases.

---

## `creators`

Create a migration with approximately this structure:

```sql
create table creators (
  id uuid primary key default gen_random_uuid(),

  youtube_channel_id text not null unique,
  channel_name text not null,
  channel_url text not null,
  thumbnail_url text,

  subscriber_count bigint,
  total_views bigint,
  video_count integer,

  avg_recent_views bigint,
  avg_recent_likes bigint,
  avg_recent_comments bigint,

  last_upload_at timestamptz,

  language text,
  country text,

  niche_score numeric,
  activity_score numeric,
  engagement_score numeric,
  overall_score numeric,

  contact_email text,
  contact_url text,

  status text not null default 'discovered',
  notes text,
  discovered_from text,

  last_synced_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint creators_status_check
    check (
      status in (
        'discovered',
        'shortlisted',
        'contacted',
        'replied',
        'negotiating',
        'partnered',
        'rejected'
      )
    )
);
```

Add sensible indexes for fields frequently filtered/sorted by, such as:

```text
overall_score
status
subscriber_count
last_upload_at
created_at
```

---

## `creator_videos`

```sql
create table creator_videos (
  id uuid primary key default gen_random_uuid(),

  creator_id uuid not null
    references creators(id)
    on delete cascade,

  youtube_video_id text not null unique,

  title text not null,
  published_at timestamptz,

  view_count bigint,
  like_count bigint,
  comment_count bigint,

  created_at timestamptz not null default now()
);
```

Keep only a small recent sample per creator.

Target:

```text
5–10 recent videos per creator
```

Never try to mirror a creator's entire YouTube history.

---

# 5. RLS / Internal-App Access

This is an internal tool.

Implement Row Level Security rather than leaving the tables publicly writable.

Assume authenticated access is required.

Create simple authenticated policies appropriate for a private internal dashboard.

Do not expose these tables to unauthenticated users.

If an existing project auth system is present, reuse it rather than building a second auth system.

---

# 6. YouTube Edge Function

Create a Supabase Edge Function responsible for YouTube discovery.

Suggested name:

```text
youtube-creator-search
```

Input:

```ts
{
  query: string
  maxResults?: number
}
```

The function should:

1. Validate the request.
2. Search YouTube for relevant videos/channels based on the query.
3. Resolve unique channel IDs.
4. Batch channel lookups where possible.
5. Fetch useful channel statistics.
6. Fetch a small number of recent videos for each candidate.
7. Fetch video statistics.
8. Normalize everything.
9. Calculate useful metrics.
10. Return a clean response to the client.

Do not return raw YouTube API payloads.

---

# 7. YouTube Data to Use

Store/use only fields that support creator qualification.

Channel data:

```text
youtube_channel_id
channel_name
channel_url
thumbnail_url
subscriber_count
total_views
video_count
country if available
latest upload date
```

Recent video sample:

```text
youtube_video_id
title
published_at
view_count
like_count
comment_count
```

Do not persist:

```text
full descriptions
all playlists
all thumbnails
caption data
comment threads
complete API response JSON
branding configuration
entire video history
```

---

# 8. Scoring

Create a scoring utility in the application/domain layer.

The score must be understandable and deterministic.

Return:

```text
niche_score
activity_score
engagement_score
overall_score
```

Use a `0–100` scale.

The exact initial formula can be pragmatic, but it must be:

```text
simple
documented
easy to change
not presented as AI
```

Suggested initial thinking:

### Niche score

Estimate relevance using the discovery query against:

```text
recent video titles
channel name
recent upload topics
```

### Activity score

Use:

```text
recency of last upload
number of recent uploads
```

### Engagement score

Use recent-video metrics such as:

```text
average views
likes / views
comments / views
```

### Overall score

Use a weighted combination.

Example starting point:

```text
45% niche relevance
25% engagement
20% activity
10% audience-size fit
```

Do not optimize purely for subscriber count.

A micro creator with strong recent performance should be able to outrank a larger but weak-fit creator.

Put scoring weights/constants in one dedicated file so they can be changed later without rewriting the UI.

---

# 9. React App Shell

Build an internal dashboard layout.

Desktop-first target:

```text
1366×768
1440×900
```

Layout:

```text
Sidebar
Topbar
Main content
```

Sidebar width:

```text
220–240px
```

For Phase 1, navigation can show:

```text
Discovery
Shortlist
```

You may display disabled / coming-later entries for:

```text
Outreach
Partners
Conversions
```

but do not build those features yet.

Prefer hiding future pages entirely over creating fake functionality.

---

# 10. Visual System

Use Depthly's visual identity.

Colors:

```text
App background       #0D0D10
Raised surface       #141417
Overlay surface      #222228
Border               #2E2E38
Primary text         #E8E6F0
Muted text           #7A7890
Brand blue           #4B9EFF
Success              #3DD68C
Warning              #F5A623
Error                #F25C5C
```

Typography:

```text
Inter
```

for normal UI.

Use:

```text
JetBrains Mono
```

for data:

```text
subscriber counts
views
percentages
scores
metrics
```

The dashboard should be denser than the Depthly public landing page.

Avoid:

```text
huge headings
hero sections
marketing cards
decorative illustrations
gradients
large entrance animations
GSAP
excessive rounded cards
```

Prefer:

```text
compact table rows
subtle borders
tight filters
small stats
clear hierarchy
functional hover states
```

---

# 11. Discovery Page

This is the main page and highest-priority screen.

Structure:

```text
Page header
Search bar
Filter row
Results summary + sort
Creator table
Creator detail drawer
```

---

## Page Header

Use:

```text
Creator Discovery
Find YouTube creators who match Depthly's audience.
```

Do not make this header excessively large.

---

## Search

Provide a large horizontal search bar.

Example:

```text
[ study with me                              ] [ Search YouTube ]
```

Example searches:

```text
study with me
student productivity
pomodoro
deep work
study motivation
focus routine
exam preparation
```

Search should call the Supabase Edge Function through TanStack Query or a mutation.

---

# 12. Filters

Implement useful client-side filters for the fetched/saved results.

Include:

```text
subscriber range
minimum average views
language
country
last upload recency
minimum overall score
status
```

Do not create dozens of filters.

The purpose is to answer:

> Is this creator realistically worth contacting for Depthly?

---

# 13. Results Summary

Show:

```text
total creators
high-fit creators
shortlisted creators
not-reviewed/discovered creators
```

Add sorting:

```text
Overall score
Average views
Subscribers
Engagement
Newest upload
```

Default:

```text
overall_score DESC
```

---

# 14. Creator Table

The creator table should dominate the page.

Columns:

```text
Creator
Subscribers
Avg Views
Engagement
Last Upload
Niche Score
Overall Score
Contact
Status
```

Optional compact action column at the end.

Creator cell:

```text
avatar
channel name
optional handle
```

Do not put long descriptions in the table.

Metrics must use the data/mono font.

Keep row height around:

```text
40–44px
```

Use compact status pills.

---

# 15. Creator Drawer

Clicking a creator row should open a right-side Sheet/Drawer.

Do not navigate away from Discovery.

Desktop width:

```text
420–520px
```

Mobile:

```text
full-screen sheet
```

Sections:

```text
creator identity
major metrics
score breakdown
recent videos
contact information
notes
status/actions
```

---

## Drawer Header

Show:

```text
avatar
channel name
YouTube link
current status
```

Actions:

```text
Shortlist
Reject
Open YouTube
```

---

## Metrics

Show:

```text
Subscribers
Average recent views
Engagement
Last upload
Overall score
```

---

## Score Breakdown

Show:

```text
Niche relevance
Activity
Engagement
Overall
```

The user must be able to understand why a creator has a high or low score.

---

## Recent Videos

Display the recent sample from `creator_videos`.

Each row:

```text
title
published date
views
likes
comments
```

Keep the section compact.

---

# 16. Contact Information

Because the YouTube Data API does not provide the public business inquiry email, make this CRM data editable manually.

Fields:

```text
Business email
Contact URL
Notes
```

Actions:

```text
Save Contact
Copy Email
Mark Contacted
```

Do not automate scraping business emails in this MVP.

---

# 17. Save / Upsert Behavior

Searching YouTube should not create duplicate creator rows.

Use:

```text
youtube_channel_id
```

as the natural unique identifier.

When the user saves/imports a discovered creator:

- insert if new
- update YouTube-derived metrics if already present
- preserve CRM fields unless explicitly changed

CRM fields that must not accidentally be overwritten by a YouTube refresh:

```text
contact_email
contact_url
status
notes
```

When refreshing YouTube data, update only YouTube-derived fields and scoring fields.

---

# 18. Shortlist Page

Create a working Shortlist page.

It should query creators whose status is:

```text
shortlisted
```

Use a table similar to Discovery with:

```text
Creator
Score
Subscribers
Avg Views
Contact
Status
Actions
```

Clicking a row should reuse the same `CreatorDrawer`.

Do not duplicate drawer implementation.

---

# 19. Data Layer

Separate concerns.

Suggested structure:

```text
src/
├── components/
│   ├── layout/
│   ├── creators/
│   ├── discovery/
│   └── ui/
│
├── pages/
│   ├── DiscoveryPage.tsx
│   └── ShortlistPage.tsx
│
├── hooks/
│   ├── useCreatorSearch.ts
│   └── useCreators.ts
│
├── lib/
│   ├── supabase/
│   ├── scoring/
│   └── utils/
│
├── types/
│   └── creators.ts
│
└── routes/
```

Suggested creator components:

```text
CreatorTable.tsx
CreatorRow.tsx
CreatorDrawer.tsx
CreatorMetrics.tsx
CreatorScoreBreakdown.tsx
CreatorRecentVideos.tsx
CreatorContactForm.tsx
SearchBar.tsx
DiscoveryFilters.tsx
SearchSummary.tsx
```

Avoid giant page components.

---

# 20. TanStack Query

Use TanStack Query for server state.

Create stable query keys.

Examples:

```text
['creators']
['creators', 'shortlisted']
['creator', creatorId]
['creator-videos', creatorId]
['youtube-search', query]
```

Mutations should invalidate only relevant queries.

Avoid unnecessary full-page reloads.

---

# 21. UX States

Implement real states.

### Empty Discovery

```text
Search YouTube to discover creators.

Try:
study with me
student productivity
pomodoro
```

### Loading Search

Use approximately:

```text
8–10 skeleton rows
```

Do not use a full-screen spinner.

### Search Error

Show a useful retry state.

### Quota Error

If YouTube returns a quota-related failure, surface a clear message.

Example:

```text
YouTube API quota reached.
Try again after the quota resets.
```

### Empty Shortlist

```text
No shortlisted creators yet.

Shortlist strong candidates from Discovery.
```

---

# 22. Responsive Behavior

Desktop is the priority.

On mobile:

```text
sidebar → drawer/menu
filters → collapsible panel
creator table → horizontal scroll or simplified rows/cards
creator drawer → full-screen
```

Do not weaken the desktop layout just to force every table column into a narrow viewport.

---

# 23. Performance / YouTube Quota

Be careful with YouTube quota.

Do not make repeated API requests for the same data unnecessarily.

Prefer:

```text
batch channel requests
batch video-stat requests
small recent-video samples
TanStack Query caching
Supabase persistence
explicit refresh actions
```

Do not refresh every creator automatically on every render.

Use `last_synced_at` to make refresh behavior understandable.

---

# 24. Important Product Rules

The app exists to answer:

```text
Who should I contact?
Have I contacted them?
```

for Phase 1.

Do not build unrelated functionality.

Do not optimize for vanity metrics.

Subscriber count is not the main ranking factor.

Depthly's target for this acquisition experiment is primarily:

```text
students
study creators
productivity creators
focus / Pomodoro creators
independent learners
```

The acquisition goal is **real users**, not maximizing short-term revenue.

---

# 25. Implementation Sequence

Work in this order.

## Step 1 — Inspect

Before coding:

- inspect the repository
- understand existing tooling/config
- reuse existing conventions where sensible
- identify whether Supabase is already initialized
- identify existing Tailwind/shadcn setup
- identify existing auth

Do not replace working project infrastructure unnecessarily.

---

## Step 2 — Foundation

Implement:

```text
routing
app shell
Depthly visual tokens
Supabase client
React Query provider
types
```

---

## Step 3 — Database

Implement:

```text
creators migration
creator_videos migration
RLS
indexes
updated_at handling
```

Do not create later-phase tables.

---

## Step 4 — YouTube Integration

Implement the Supabase Edge Function.

Add clear environment/secret documentation.

Never expose the YouTube key to React.

---

## Step 5 — Discovery UI

Implement:

```text
search
filters
sort
results summary
creator table
loading/error/empty states
```

---

## Step 6 — Creator Drawer

Implement:

```text
metrics
score breakdown
recent videos
manual contact fields
notes
status updates
shortlist/reject actions
```

---

## Step 7 — Persistence

Implement:

```text
save/upsert creator
save recent videos
refresh YouTube fields
preserve CRM fields
```

---

## Step 8 — Shortlist

Implement the Shortlist page using shared components.

---

## Step 9 — Verify

Run:

```text
TypeScript checks
lint
production build
```

Fix all errors introduced by this work.

Review responsive behavior for at least:

```text
1366×768
1440×900
mobile width
```

---

# 26. Do Not Build Yet

Explicitly do not build:

```text
affiliate payout system
80% commission calculations
Lemon Squeezy integration
partner referral URLs
creator_partnerships UI
creator_conversions UI
conversion analytics
outreach email sending
email scraping
automated cold email
Outreach Kanban
advanced analytics
AI creator scoring
background cron refresh
bulk outreach automation
```

These are later phases.

---

# 27. Completion Criteria

Phase 1 is complete when I can:

1. Open the app.
2. Search `study with me`.
3. Receive real creator results through the Supabase Edge Function.
4. See creator metrics in a dense table.
5. Filter and sort the results.
6. Open a creator drawer.
7. Understand the creator's score.
8. Review recent videos.
9. Save the creator to Supabase.
10. Shortlist the creator.
11. Add a public business email/contact URL manually.
12. Add notes.
13. Change the creator's status.
14. Reopen the creator later and see the saved CRM data.
15. Open the Shortlist page and see shortlisted creators.
16. Refresh YouTube-derived metrics without overwriting CRM fields.
17. Build/type-check the project without errors.

---

# 28. Working Style

Do not stop after generating a plan.

Inspect the repository and begin implementing.

Work incrementally and keep the project runnable.

Prefer simple, explicit code over premature abstractions.

When you encounter ambiguity, make the smallest reasonable decision that stays consistent with the two specification files.

Do not silently expand scope.

At the end, provide:

```text
1. Summary of what was implemented
2. Files created/changed
3. Supabase migrations created
4. Edge Functions created
5. Required Supabase secrets
6. Commands I need to run
7. Any manual Supabase setup still required
8. Known limitations
9. Recommended next step
```

The two specification files remain the source of truth throughout implementation.
