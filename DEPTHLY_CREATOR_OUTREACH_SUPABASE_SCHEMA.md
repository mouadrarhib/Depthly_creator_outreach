# Depthly Creator Outreach — Supabase Schema

## 1. Purpose

This database supports an internal creator acquisition tool for Depthly.

Main flow:

```text
YouTube API
   ↓
Discover relevant creators
   ↓
Score and shortlist creators
   ↓
Store useful creator data in Supabase
   ↓
Find/add public business contact
   ↓
Track outreach
   ↓
Create partnership/referral link
   ↓
Track signups, paid conversions, and creator commission
```

Supabase should **not** store a full copy of YouTube data.

YouTube remains the source of truth for live channel/video statistics.
Supabase stores only the data needed for creator qualification, outreach, partnerships, and revenue tracking.

---

# 2. Core Tables

## `creators`

Stores one row per discovered YouTube creator/channel.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `youtube_channel_id` | `text` | Unique YouTube channel ID |
| `channel_name` | `text` | Channel display name |
| `channel_url` | `text` | Public channel URL |
| `thumbnail_url` | `text` | Channel avatar |
| `subscriber_count` | `bigint` | Latest known subscriber count |
| `total_views` | `bigint` | Latest known total channel views |
| `video_count` | `integer` | Latest known channel video count |
| `avg_recent_views` | `bigint` | Average views across sampled recent videos |
| `avg_recent_likes` | `bigint` | Average likes across sampled recent videos |
| `avg_recent_comments` | `bigint` | Average comments across sampled recent videos |
| `last_upload_at` | `timestamptz` | Latest detected upload |
| `language` | `text` | Optional detected/assigned language |
| `country` | `text` | Optional channel country |
| `niche_score` | `numeric` | Relevance to Depthly's niche |
| `activity_score` | `numeric` | Upload consistency/activity |
| `engagement_score` | `numeric` | Audience interaction score |
| `overall_score` | `numeric` | Final creator ranking score |
| `contact_email` | `text` | Public business email when manually found |
| `contact_url` | `text` | Website/contact/social URL |
| `status` | `text` | Outreach pipeline status |
| `notes` | `text` | Internal notes |
| `discovered_from` | `text` | Search phrase that found the creator |
| `last_synced_at` | `timestamptz` | Last YouTube API refresh |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()` |

### Suggested `status` values

```text
discovered
shortlisted
contacted
replied
negotiating
partnered
rejected
```

### Important constraint

```sql
unique (youtube_channel_id)
```

This prevents the same creator from being inserted multiple times through different search keywords.

---

## `creator_videos`

Stores only a small sample of recent videos used to evaluate creators.

Recommended: keep approximately **5–10 recent videos per creator**, not their full YouTube history.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `creator_id` | `uuid` | FK → `creators.id` |
| `youtube_video_id` | `text` | Unique YouTube video ID |
| `title` | `text` | Video title |
| `published_at` | `timestamptz` | Upload date |
| `view_count` | `bigint` | Latest sampled view count |
| `like_count` | `bigint` | Latest sampled like count |
| `comment_count` | `bigint` | Latest sampled comment count |
| `created_at` | `timestamptz` | Default `now()` |

### Constraints

```sql
unique (youtube_video_id)
```

```sql
creator_id references creators(id) on delete cascade
```

---

## `creator_partnerships`

Created only when a creator agrees to promote Depthly.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `creator_id` | `uuid` | FK → `creators.id` |
| `referral_code` | `text` | Unique creator code |
| `referral_slug` | `text` | Optional URL-friendly identifier |
| `commission_percent` | `numeric` | Example: `80` |
| `status` | `text` | Partnership status |
| `started_at` | `timestamptz` | Partnership start |
| `ended_at` | `timestamptz` | Nullable |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()` |

### Suggested `status`

```text
active
paused
ended
```

### Constraints

```sql
unique (referral_code)
```

```sql
unique (referral_slug)
```

---

## `creator_conversions`

Tracks Depthly users attributed to creators.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `partnership_id` | `uuid` | FK → `creator_partnerships.id` |
| `depthly_user_id` | `uuid` | Depthly user |
| `plan` | `text` | Purchased plan |
| `amount_paid` | `numeric` | Gross customer payment |
| `creator_commission` | `numeric` | Creator's share |
| `depthly_revenue` | `numeric` | Depthly's retained share |
| `currency` | `text` | Example: `USD` |
| `payment_status` | `text` | Payment state |
| `converted_at` | `timestamptz` | Paid conversion date |
| `created_at` | `timestamptz` | Default `now()` |

### Suggested `payment_status`

```text
pending
paid
refunded
cancelled
```

### Example calculation

For an 80% creator commission:

```text
Customer payment:    $5.00
Creator commission:  $4.00
Depthly revenue:     $1.00
```

The actual commission should be calculated server-side from the partnership's stored percentage.

---

# 3. Optional Table — Outreach History

## `creator_outreach`

Useful if you want to record every email/message instead of storing only the current status on `creators`.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `creator_id` | `uuid` | FK → `creators.id` |
| `channel` | `text` | `email`, `instagram`, `x`, etc. |
| `contact_value` | `text` | Email/address/profile used |
| `status` | `text` | Sent/replied/follow-up/etc. |
| `message_subject` | `text` | Optional |
| `sent_at` | `timestamptz` | When outreach occurred |
| `replied_at` | `timestamptz` | Nullable |
| `notes` | `text` | Internal notes |
| `created_at` | `timestamptz` | Default `now()` |

Suggested statuses:

```text
draft
sent
replied
follow_up
interested
declined
```

For the first MVP, this table is optional. A simple `status` field on `creators` is enough.

---

# 4. Relationships

```text
creators
   │
   ├── 1:N → creator_videos
   │
   ├── 1:N → creator_outreach
   │
   └── 1:N → creator_partnerships
                 │
                 └── 1:N → creator_conversions
```

---

# 5. What Should NOT Be Stored

Avoid storing complete YouTube API responses.

Do not persist unnecessary fields such as:

```text
full video descriptions
all channel playlists
all channel videos
all thumbnails at every resolution
full API response JSON
caption data
comment threads
topic metadata you never use
branding configuration
```

Store only fields that influence:

```text
creator discovery
creator scoring
contact decisions
outreach
partnerships
conversion tracking
commission tracking
```

---

# 6. YouTube API vs Supabase

## YouTube API owns

```text
current subscribers
current views
video statistics
latest uploads
channel metadata
```

## Supabase owns

```text
which creators Depthly discovered
which creators are worth contacting
scores
business contact information
outreach status
notes
partnership agreements
referral codes
conversions
commissions
```

---

# 7. Recommended MVP

Start with only:

```text
creators
creator_videos
```

Build:

```text
Search YouTube
→ fetch channels
→ fetch recent videos
→ calculate scores
→ save creators
→ shortlist
→ manually add contact email
→ mark contacted/replied/etc.
```

Only add:

```text
creator_partnerships
creator_conversions
creator_outreach
```

after creators actually begin responding and agreeing to promote Depthly.

This keeps the first version small and avoids building affiliate infrastructure before the acquisition channel is validated.
