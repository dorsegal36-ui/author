import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL || 'https://quietfictions.com',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'never'
});
