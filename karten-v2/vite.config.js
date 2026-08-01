import { defineConfig } from 'vite';

// karten-v2 is a standalone project. It is reachable in production via a
// Netlify rewrite from /karten-v2/* to /karten-v2/dist/:splat (see
// ../netlify.toml). base must match that public path so Vite emits correct
// absolute asset URLs.
export default defineConfig({
  base: '/karten-v2/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5183,
  },
});
