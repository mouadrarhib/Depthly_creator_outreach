create extension if not exists pgcrypto;

create table public.creators (
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
  niche_score numeric not null default 0 check (niche_score between 0 and 100),
  activity_score numeric not null default 0 check (activity_score between 0 and 100),
  engagement_score numeric not null default 0 check (engagement_score between 0 and 100),
  overall_score numeric not null default 0 check (overall_score between 0 and 100),
  contact_email text,
  contact_url text,
  status text not null default 'discovered',
  notes text,
  discovered_from text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint creators_status_check check (
    status in ('discovered', 'shortlisted', 'contacted', 'replied', 'negotiating', 'partnered', 'rejected')
  )
);

create table public.creator_videos (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators(id) on delete cascade,
  youtube_video_id text not null unique,
  title text not null,
  published_at timestamptz,
  view_count bigint,
  like_count bigint,
  comment_count bigint,
  created_at timestamptz not null default now()
);

create index creators_overall_score_idx on public.creators (overall_score desc);
create index creators_status_idx on public.creators (status);
create index creators_subscriber_count_idx on public.creators (subscriber_count desc);
create index creators_last_upload_at_idx on public.creators (last_upload_at desc);
create index creators_created_at_idx on public.creators (created_at desc);
create index creator_videos_creator_published_idx on public.creator_videos (creator_id, published_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger creators_set_updated_at
before update on public.creators
for each row execute function public.set_updated_at();

alter table public.creators enable row level security;
alter table public.creator_videos enable row level security;

create policy "Authenticated users can read creators"
on public.creators for select to authenticated using (true);
create policy "Authenticated users can insert creators"
on public.creators for insert to authenticated with check (true);
create policy "Authenticated users can update creators"
on public.creators for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete creators"
on public.creators for delete to authenticated using (true);

create policy "Authenticated users can read creator videos"
on public.creator_videos for select to authenticated using (true);
create policy "Authenticated users can insert creator videos"
on public.creator_videos for insert to authenticated with check (true);
create policy "Authenticated users can update creator videos"
on public.creator_videos for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete creator videos"
on public.creator_videos for delete to authenticated using (true);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.creators to authenticated;
grant select, insert, update, delete on public.creator_videos to authenticated;
revoke all on public.creators from anon;
revoke all on public.creator_videos from anon;
