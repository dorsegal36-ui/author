create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  story_slug text not null,
  author_name text,
  body text not null,
  created_at timestamptz not null default now(),
  constraint comments_story_slug_length check (char_length(story_slug) between 1 and 160),
  constraint comments_author_name_length check (author_name is null or char_length(author_name) <= 80),
  constraint comments_body_length check (char_length(body) between 1 and 2000)
);

alter table public.comments enable row level security;

drop policy if exists "Anyone can read comments" on public.comments;
create policy "Anyone can read comments"
  on public.comments
  for select
  using (true);

drop policy if exists "Anyone can submit comments" on public.comments;
create policy "Anyone can submit comments"
  on public.comments
  for insert
  with check (
    char_length(story_slug) between 1 and 160
    and (author_name is null or char_length(author_name) <= 80)
    and char_length(body) between 1 and 2000
  );
