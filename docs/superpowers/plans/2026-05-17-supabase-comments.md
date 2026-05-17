# Supabase Comments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add immediate, anonymous-capable, ad-free comments to story pages using Supabase.

**Architecture:** The Astro story page keeps rendering statically, while a browser-side comments component loads and submits comments through Supabase's public anon API. Pure validation and normalization live in `src/lib/comments.mjs` with node tests; the component owns DOM rendering and network behavior.

**Tech Stack:** Astro, vanilla browser JavaScript, `@supabase/supabase-js`, Node test runner, Supabase Postgres.

---

## File Structure

- Create `src/lib/comments.mjs`: pure helpers for normalizing author names, validating comment text, and building insert payloads.
- Create `src/lib/comments.test.mjs`: unit tests for comment helper behavior.
- Modify `src/components/Comments.astro`: replace Disqus with Supabase-backed list and form.
- Modify `src/styles/global.css`: add compact comments styles matching the story page.
- Modify `package.json` and `package-lock.json`: add `@supabase/supabase-js`.
- Create `docs/supabase-comments.sql`: SQL setup the owner can paste into Supabase.

### Task 1: Comment Helpers

**Files:**
- Create: `src/lib/comments.mjs`
- Create: `src/lib/comments.test.mjs`

- [ ] **Step 1: Write the failing tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COMMENT_LIMITS,
  displayAuthorName,
  normalizeCommentInput
} from './comments.mjs';

test('displayAuthorName uses Anonymous for missing names', () => {
  assert.equal(displayAuthorName(''), 'Anonymous');
  assert.equal(displayAuthorName('   '), 'Anonymous');
  assert.equal(displayAuthorName(null), 'Anonymous');
});

test('normalizeCommentInput trims valid author and body', () => {
  const result = normalizeCommentInput({
    storySlug: 'el-peor-enemigo',
    authorName: '  Dana  ',
    body: '  A sharp ending.  '
  });

  assert.deepEqual(result, {
    ok: true,
    value: {
      story_slug: 'el-peor-enemigo',
      author_name: 'Dana',
      body: 'A sharp ending.'
    }
  });
});

test('normalizeCommentInput stores blank author as null', () => {
  const result = normalizeCommentInput({
    storySlug: 'el-peor-enemigo',
    authorName: '',
    body: 'I liked this.'
  });

  assert.equal(result.ok, true);
  assert.equal(result.value.author_name, null);
});

test('normalizeCommentInput rejects blank body', () => {
  const result = normalizeCommentInput({
    storySlug: 'el-peor-enemigo',
    authorName: 'Dana',
    body: '   '
  });

  assert.deepEqual(result, {
    ok: false,
    error: 'Write a comment before submitting.'
  });
});

test('normalizeCommentInput rejects overlong body', () => {
  const result = normalizeCommentInput({
    storySlug: 'el-peor-enemigo',
    authorName: 'Dana',
    body: 'x'.repeat(COMMENT_LIMITS.bodyMax + 1)
  });

  assert.deepEqual(result, {
    ok: false,
    error: `Comments must be ${COMMENT_LIMITS.bodyMax} characters or fewer.`
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`

Expected: `ERR_MODULE_NOT_FOUND` for `src/lib/comments.mjs`.

- [ ] **Step 3: Implement helpers**

```js
export const COMMENT_LIMITS = {
  authorMax: 80,
  bodyMax: 2000,
  storySlugMax: 160
};

function normalizeWhitespace(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

export function displayAuthorName(authorName) {
  const normalized = normalizeWhitespace(authorName);
  return normalized || 'Anonymous';
}

export function normalizeCommentInput({ storySlug, authorName, body }) {
  const normalizedSlug = normalizeWhitespace(storySlug);
  const normalizedAuthor = normalizeWhitespace(authorName);
  const normalizedBody = String(body ?? '').trim();

  if (!normalizedSlug) {
    return { ok: false, error: 'This story cannot accept comments right now.' };
  }

  if (normalizedSlug.length > COMMENT_LIMITS.storySlugMax) {
    return { ok: false, error: 'This story cannot accept comments right now.' };
  }

  if (normalizedAuthor.length > COMMENT_LIMITS.authorMax) {
    return {
      ok: false,
      error: `Names must be ${COMMENT_LIMITS.authorMax} characters or fewer.`
    };
  }

  if (!normalizedBody) {
    return { ok: false, error: 'Write a comment before submitting.' };
  }

  if (normalizedBody.length > COMMENT_LIMITS.bodyMax) {
    return {
      ok: false,
      error: `Comments must be ${COMMENT_LIMITS.bodyMax} characters or fewer.`
    };
  }

  return {
    ok: true,
    value: {
      story_slug: normalizedSlug,
      author_name: normalizedAuthor || null,
      body: normalizedBody
    }
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`

Expected: all tests pass.

### Task 2: Supabase Dependency and SQL

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `docs/supabase-comments.sql`

- [ ] **Step 1: Install dependency**

Run: `npm install @supabase/supabase-js`

Expected: `@supabase/supabase-js` appears in dependencies and lockfile updates.

- [ ] **Step 2: Add SQL setup document**

Create `docs/supabase-comments.sql`:

```sql
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
```

### Task 3: Comments Component

**Files:**
- Modify: `src/components/Comments.astro`

- [ ] **Step 1: Replace Disqus component with Supabase UI**

Use the story slug as `data-story-slug`, read `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`, and render a disabled message when either is missing. The browser script imports `createClient` from `@supabase/supabase-js` and `displayAuthorName` / `normalizeCommentInput` from `src/lib/comments.mjs`.

- [ ] **Step 2: Implement client behavior**

The script must:

- Select comments by `story_slug`.
- Order by `created_at` ascending.
- Render author, date, and body.
- Submit normalized payloads.
- Ignore submissions when honeypot has a value.
- Disable the submit button while saving.
- Prepend no fake success; render from the returned inserted row.

### Task 4: Styles

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add comments styles**

Add styles for `.comments`, `.comment-list`, `.comment`, `.comment-form`, `.comment-field`, `.comment-actions`, `.comment-status`, and `.honeypot` using the existing paper, line, muted, and accent variables.

### Task 5: Verification and Push

**Files:**
- All changed files

- [ ] **Step 1: Run tests**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: Astro check has 0 errors, 0 warnings, 0 hints; build completes.

- [ ] **Step 3: Commit scoped files**

Run:

```bash
git add package.json package-lock.json src/components/Comments.astro src/lib/comments.mjs src/lib/comments.test.mjs src/styles/global.css docs/supabase-comments.sql docs/superpowers/specs/2026-05-17-supabase-comments-design.md docs/superpowers/plans/2026-05-17-supabase-comments.md
git commit -m "Add Supabase comments"
```

- [ ] **Step 4: Push and verify deployment**

Run:

```bash
git push
gh run list --limit 1
gh run watch <run-id> --exit-status
```

Expected: GitHub Pages build and deploy succeed.
