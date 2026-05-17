# Supabase Comments Design

## Goal

Add immediate public comments to story pages with no reader registration, no ads, and optional display names.

## User Experience

Each published story page shows a comments section below the story. Visitors see existing comments for that story, then a compact form with an optional name field and a required comment field. If the visitor leaves the name blank, the submitted comment displays as `Anonymous`. After submission succeeds, the new comment appears in the list without a page reload.

## Architecture

The static Astro site will use Supabase directly from the browser with the public anon key. Supabase will store comments in a `comments` table and enforce simple insert/select permissions through row-level security. The site will not contain any secret service-role keys.

## Data Model

Table: `comments`

- `id uuid primary key default gen_random_uuid()`
- `story_slug text not null`
- `author_name text`
- `body text not null`
- `created_at timestamptz not null default now()`

Recommended constraints:

- `char_length(story_slug) between 1 and 160`
- `author_name is null or char_length(author_name) <= 80`
- `char_length(body) between 1 and 2000`

## Supabase Policies

Enable row-level security on `comments`.

- Public `select`: anyone can read comments.
- Public `insert`: anyone can submit a comment when `story_slug` and `body` are non-empty and length constraints pass.
- No public `update` or `delete`; the site owner removes bad comments in the Supabase dashboard.

## Frontend Components

Replace the current Disqus implementation in `src/components/Comments.astro` with a custom comments UI. The component passes the story slug and title to a browser script. The script imports a small comments client, loads comments for the current story, renders them, and handles form submission.

Create `src/lib/comments.mjs` for pure validation/normalization helpers that are easy to test. Keep Supabase-specific browser behavior inside the component script so tests do not need network access.

## Configuration

Use public environment variables:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

If either is missing, show a quiet unavailable message instead of rendering a broken form.

## Error Handling

Show a short inline status when comments fail to load or submit. Keep the visitor's draft in the form if submission fails. Disable the submit button while a request is in flight.

## Spam Posture

Initial protection is intentionally lightweight: body length limits, optional author length limits, trimming, and a hidden honeypot field. If spam appears, add moderation or CAPTCHA in a later iteration.

## Testing

Add tests for comment normalization and validation:

- Blank author becomes `Anonymous` for display.
- Author is trimmed and limited.
- Blank body is rejected.
- Overlong body is rejected.
- Valid input returns the normalized payload.

Run `npm test` and `npm run build` before pushing.
