// @ts-check
import { defineConfig } from 'astro/config';

// Hosted on GitHub Pages at https://srushtigpm.github.io/SGportfolio/.
// With a custom domain, set `site` to it and remove `base`.
export default defineConfig({
  site: 'https://srushtigpm.github.io',
  base: '/SGportfolio',
  trailingSlash: 'ignore',
  // three.js is one deliberate ~520 kB chunk on the home page only
  vite: { build: { chunkSizeWarningLimit: 700 } },
});
