# Depthly Creator Outreach — React UI Reference

## 1. Purpose

This React app is an **internal creator discovery and outreach dashboard** for Depthly.

It should help with this workflow:

```text
Search YouTube
→ evaluate creators
→ shortlist the best ones
→ find/add public contact details
→ track outreach
→ create partnerships
→ track conversions and commissions
```

This is **not** a public marketing page.

The UI should feel like a compact internal CRM/dashboard:
- fast to scan
- data-dense
- minimal
- focused on decisions and actions

---

# 2. Main App Layout

Use a standard application shell.

```text
┌──────────────────────────────────────────────────────────────┐
│ Sidebar │ Topbar                                             │
│         ├────────────────────────────────────────────────────│
│         │                                                    │
│         │ Main page content                                  │
│         │                                                    │
│         │                                                    │
└──────────────────────────────────────────────────────────────┘
```

## Sidebar

Recommended width:

```text
220–240px expanded
```

Navigation:

```text
Discovery
Shortlist
Outreach
Partners
Conversions
```

Optional bottom section:

```text
Settings
Depthly
```

### Active navigation

Use Depthly brand blue for the active section.

Example:

```text
● Discovery
  Shortlist
  Outreach
  Partners
  Conversions
```

Do not overdecorate the sidebar.

---

# 3. Topbar

Keep the topbar simple.

Left:

```text
Page title
small description
```

Example:

```text
Creator Discovery
Find YouTube creators who match Depthly's audience.
```

Right:

```text
API usage / quota indicator
Refresh button
profile/avatar
```

Example:

```text
YouTube quota: 18%
Last sync: 4 min ago
```

Quota should not dominate the UI.

---

# 4. Discovery Page

This is the **most important page** and should be built first.

The page consists of:

```text
Search controls
↓
Filters
↓
Results summary
↓
Creator table
↓
Creator detail drawer
```

---

## Search Header

Large horizontal search input.

Example:

```text
[ study with me                                  ] [ Search YouTube ]
```

Search examples:

```text
study with me
student productivity
pomodoro
deep work
study motivation
focus routine
exam preparation
```

Provide a small recent-search area below or inside the search input.

Example:

```text
Recent:
study with me · pomodoro · student productivity
```

---

# 5. Filters

Filters should sit directly under the search bar.

Recommended filters:

```text
Subscribers
Average views
Language
Country
Last upload
Overall score
Status
```

Example layout:

```text
Subscribers     Avg views      Language     Country
[1K – 100K]     [5K+]          [English ▼]  [All ▼]

Last upload     Score
[30 days ▼]     [70+]
```

Avoid putting every possible YouTube property into the UI.

The filters should answer:

> Is this creator realistically worth contacting for Depthly?

---

# 6. Results Summary

Above the table show a small summary row.

Example:

```text
126 creators found

34 high-fit
21 shortlisted
71 not reviewed
```

Optional sorting:

```text
Sort by:
Overall score
Average views
Subscribers
Engagement
Newest upload
```

Default:

```text
Overall score DESC
```

---

# 7. Creator Table

Use a dense table as the primary Discovery interface.

Recommended columns:

| Column | Purpose |
|---|---|
| Creator | Avatar + channel name |
| Subscribers | Channel size |
| Avg Views | Average recent video performance |
| Engagement | Likes/comments relative to views |
| Last Upload | Channel activity |
| Niche Score | Depthly relevance |
| Overall Score | Final ranking |
| Contact | Email/contact availability |
| Status | Pipeline state |
| Action | Open/details |

Example:

```text
┌─────────────────┬──────┬───────────┬────────┬──────────┬───────┬────────┐
│ Creator         │ Subs │ Avg Views │ Engage │ Last     │ Score │ Status │
├─────────────────┼──────┼───────────┼────────┼──────────┼───────┼────────┤
│ StudyWithAnna   │ 42K  │ 18.4K     │ 6.4%   │ 2d ago   │ 89    │ Short  │
│ FocusWithJames  │ 18K  │ 11.1K     │ 8.2%   │ 5d ago   │ 86    │ New    │
│ StudentLab      │ 67K  │ 7.8K      │ 3.1%   │ 12d ago  │ 72    │ New    │
└─────────────────┴──────┴───────────┴────────┴──────────┴───────┴────────┘
```

---

## Creator Column

Show:

```text
avatar
channel name
optional @handle
```

Do not show long channel descriptions in the table.

---

## Metrics

Use JetBrains Mono / Depthly's `font-data` style for:

```text
42K
18.4K
6.4%
89
```

This makes numeric data easier to scan.

---

## Score Styling

Keep score colors restrained.

Example:

```text
85–100   strong
70–84    medium
<70      weak
```

Do not turn the table into a rainbow.

Depthly brand blue can be used for high-priority scoring or selection.

---

## Status

Suggested statuses:

```text
Discovered
Shortlisted
Contacted
Replied
Negotiating
Partnered
Rejected
```

Use compact pills.

Example:

```text
[Shortlisted]
```

---

# 8. Creator Detail Drawer

Clicking a table row should open a **right-side drawer**.

Recommended width:

```text
420–520px desktop
full-screen sheet on mobile
```

Do not navigate to another page just to inspect a creator.

The user should remain in the search results.

---

## Drawer Header

Show:

```text
avatar
channel name
@handle
YouTube external link
current status
```

Actions:

```text
Shortlist
Reject
Open YouTube
```

---

## Creator Summary

Show major statistics first:

```text
Subscribers      42.3K
Avg recent views 18.4K
Engagement       6.4%
Last upload      2 days ago
Overall score    89 / 100
```

---

# 9. Score Breakdown

The detail drawer should explain why the creator scored well.

Example:

```text
Creator Fit

Niche relevance      94
Audience activity    87
Engagement           82
Consistency          91

Overall              89
```

This is important because the score should help make a decision rather than behave like a mysterious AI number.

---

# 10. Recent Videos

Show only approximately the latest 5–10 sampled videos.

Each row/card:

```text
thumbnail
title
published date
views
likes
comments
```

Example:

```text
How I Study 6 Hours Without Burning Out
4 days ago
23.8K views · 1.8K likes · 126 comments
```

Keep these compact.

The goal is to understand:

```text
Does this creator actually reach the audience Depthly wants?
```

---

# 11. Contact Section

Since YouTube API does not provide the creator business email directly, contact information should be treated as your own CRM data.

Fields:

```text
Business email
Contact URL
Preferred channel
Notes
```

Example:

```text
Business email
[ anna@example.com ]

Contact URL
[ instagram.com/... ]

Notes
[ Strong study audience, mostly university students ]
```

Actions:

```text
Save Contact
Copy Email
Mark Contacted
```

---

# 12. Shortlist Page

Purpose:

> Show only creators worth spending outreach time on.

Use essentially the same table as Discovery but remove low-value discovery noise.

Recommended columns:

```text
Creator
Score
Subscribers
Avg Views
Contact
Status
Last Contact
Actions
```

Top summary:

```text
34 shortlisted creators
18 with contact details
9 contacted
7 waiting for outreach
```

Primary action:

```text
Start Outreach
```

---

# 13. Outreach Page

Use a Kanban board.

Recommended columns:

```text
TO CONTACT
CONTACTED
REPLIED
NEGOTIATING
PARTNERED
DECLINED
```

Example:

```text
┌────────────┬────────────┬────────────┬──────────────┬────────────┐
│ TO CONTACT │ CONTACTED  │ REPLIED    │ NEGOTIATING  │ PARTNERED  │
├────────────┼────────────┼────────────┼──────────────┼────────────┤
│ Anna       │ StudyLab   │ FocusMike  │ SarahStudy   │ JamesFocus │
│ Tom        │ EmmaStudy  │            │              │            │
└────────────┴────────────┴────────────┴──────────────┴────────────┘
```

Each card should show:

```text
Creator
score
subscriber count
contact method
last activity
```

Example:

```text
StudyWithAnna
89 score · 42K subs

anna@example.com

Last action: —
```

---

# 14. Outreach Creator Card

Clicking the creator opens the same creator drawer.

Additional outreach fields:

```text
First contacted
Last contacted
Number of follow-ups
Reply status
Notes
```

Potential actions:

```text
Copy email
Mark contacted
Mark replied
Move to negotiating
Reject
Create partnership
```

---

# 15. Partners Page

Only creators with an active partnership appear here.

Use a table.

Columns:

```text
Creator
Referral code
Commission
Signups
Paid users
Revenue generated
Creator share
Depthly share
Status
```

Example:

```text
StudyWithAnna
ANNA20
80%
34 signups
17 paid
$145 generated
$116 creator
$29 Depthly
Active
```

---

# 16. Partner Detail View

Show:

```text
Creator identity
partnership status
referral URL
commission rate
performance
conversion history
```

Example:

```text
StudyWithAnna

Referral URL
https://getdepthly.com/r/anna

Commission
80%

Performance

34 signups
17 paid users
50% signup → paid

$145 total revenue
$116 creator commission
$29 Depthly revenue
```

Primary actions:

```text
Copy referral link
Pause partnership
Edit commission
```

---

# 17. Conversions Page

This is mainly a reporting page.

Top metrics:

```text
Total creator signups
Paid conversions
Conversion rate
Revenue generated
Creator commissions
Depthly revenue
```

Then a table:

```text
Creator
User
Plan
Amount
Creator Commission
Depthly Revenue
Status
Date
```

Filters:

```text
Creator
Date range
Plan
Payment status
```

---

# 18. Empty States

Every page needs a useful empty state.

## Discovery

```text
Search YouTube to discover creators.

Try:
"study with me"
"student productivity"
"pomodoro"
```

## Shortlist

```text
No shortlisted creators yet.

Shortlist strong candidates from Discovery.
```

## Outreach

```text
No creators ready for outreach.

Add creators to your shortlist first.
```

## Partners

```text
No partnerships yet.

Creators who accept your offer will appear here.
```

---

# 19. Loading States

Use skeleton rows rather than a full-screen spinner.

Discovery search:

```text
Searching YouTube...
```

Then display approximately 8–10 skeleton table rows.

When refreshing one creator's data, update only that row/drawer instead of blocking the entire page.

---

# 20. Error States

YouTube API errors should be clear.

Examples:

```text
YouTube quota reached.
Try again after quota reset.
```

```text
Could not load channel statistics.
Retry
```

```text
Search failed.
Retry search
```

Do not silently fail.

---

# 21. Mobile Behavior

This is primarily a desktop/internal tool, so optimize for normal laptop dimensions first.

Desktop target:

```text
1366×768
1440×900
```

At these sizes:

```text
sidebar remains visible
search + filters fit without excessive scrolling
table is the dominant viewport element
drawer fits beside the table
```

On mobile:

```text
sidebar → drawer/menu
filters → collapsible filter panel
table → horizontally scrollable or simplified cards
creator drawer → full-screen sheet
kanban → horizontal scroll
```

Do not compromise the desktop UI just to make every table column fit on a phone.

---

# 22. Depthly Visual Style

Reuse Depthly's existing visual identity.

## Base colors

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

## Typography

```text
Inter
```

for:

```text
navigation
headings
buttons
labels
creator names
```

Use:

```text
JetBrains Mono / font-data
```

for:

```text
subscriber counts
views
percentages
scores
revenue
commission values
conversion metrics
```

---

# 23. Density

This dashboard should be **denser than the public Depthly landing page**.

Avoid:

```text
huge headings
large empty hero sections
marketing-style cards
large decorative illustrations
unnecessary animations
```

Prefer:

```text
compact 40–44px table rows
small stat cards
tight filters
clear separators
strong hierarchy
hover states
drawers instead of unnecessary route changes
```

---

# 24. Animation

Keep animation functional.

Allowed:

```text
drawer slide
small row hover
button transitions
loading skeleton
small score/status transitions
kanban drag-and-drop
```

Avoid:

```text
GSAP landing-page style reveals
large entrance animations
background effects
decorative motion
```

This is a work tool, not a marketing experience.

---

# 25. Recommended Component Structure

```text
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Topbar.tsx
│   │
│   ├── creators/
│   │   ├── CreatorTable.tsx
│   │   ├── CreatorRow.tsx
│   │   ├── CreatorDrawer.tsx
│   │   ├── CreatorMetrics.tsx
│   │   ├── CreatorScoreBreakdown.tsx
│   │   ├── CreatorRecentVideos.tsx
│   │   └── CreatorContactForm.tsx
│   │
│   ├── discovery/
│   │   ├── SearchBar.tsx
│   │   ├── DiscoveryFilters.tsx
│   │   └── SearchSummary.tsx
│   │
│   ├── outreach/
│   │   ├── OutreachBoard.tsx
│   │   ├── OutreachColumn.tsx
│   │   └── OutreachCard.tsx
│   │
│   ├── partners/
│   │   ├── PartnerTable.tsx
│   │   └── PartnerDrawer.tsx
│   │
│   └── ui/
│
├── pages/
│   ├── DiscoveryPage.tsx
│   ├── ShortlistPage.tsx
│   ├── OutreachPage.tsx
│   ├── PartnersPage.tsx
│   └── ConversionsPage.tsx
│
└── hooks/
```

---

# 26. Recommended Build Order

## Phase 1 — Core MVP

Build only:

```text
App shell
Discovery page
Search
Filters
Creator table
Creator drawer
Save creator to Supabase
Shortlist creator
Contact fields
Status changes
```

This is enough to start using the tool.

---

## Phase 2 — Outreach

Add:

```text
Shortlist page
Outreach Kanban
contact tracking
notes
follow-up tracking
```

Only build this once creator discovery works well.

---

## Phase 3 — Partnerships

Add:

```text
Partners page
referral code
commission percentage
referral URLs
```

---

## Phase 4 — Conversion Analytics

Add:

```text
Conversions
creator revenue
commissions
conversion rate
partner performance ranking
```

---

# 27. Core UI Principle

Every screen should help answer one of four questions:

```text
1. Who should I contact?
2. Have I contacted them?
3. Did they agree?
4. Are they bringing Depthly users?
```

Anything that does not help answer one of those questions should probably not be in the first version.
