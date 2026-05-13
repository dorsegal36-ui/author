# Stories

A static story website built with Astro, Decap CMS, Netlify, and Disqus.

## Local Development

```bash
npm install
npm run import:stories
npm run dev
```

## Build

```bash
npm run build
```

## Admin Editing

The admin interface lives at `/admin/`. On Netlify, enable Identity and Git Gateway, then invite the site owner as a user. After login, stories can be created, edited, drafted, and published from the browser.

## Comments

Create a Disqus site and set `PUBLIC_DISQUS_SHORTNAME` in Netlify environment variables. Without that variable, story pages show a comments placeholder.

## Deploy on Netlify

Use these build settings:

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: current LTS

The site can use the default Netlify subdomain first. A custom domain can be added later in Netlify domain settings.
