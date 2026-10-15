import { execFileSync } from 'node:child_process';
import { access } from 'node:fs/promises';
import path from 'node:path';

// A one-time inventory for a missing baseline. No file contents or environment
// values are logged, and optional metrics never fail a publication.
export async function reportBuildCache(environment, log = console.log) {
  if (environment.NETLIFY !== 'true' || process.platform !== 'linux') return;
  const candidates = [...new Set([environment.NETLIFY_CACHE_DIR, '/opt/build/cache', '/opt/buildhome/cache'].filter(Boolean))];
  for (const directory of candidates) {
    try {
      await access(directory);
      const output = execFileSync('du', ['-k', '--max-depth=1', directory], {
        encoding: 'utf8', timeout: 10000, maxBuffer: 128 * 1024, stdio: ['ignore', 'pipe', 'ignore']
      });
      const entries = output.trim().split('\n').flatMap(line => {
        const match = line.match(/^(\d+)\s+(.+)$/);
        return match ? [{ directory: path.basename(match[2]), MiB: Math.round(Number(match[1]) / 1024) }] : [];
      }).sort((a, b) => b.MiB - a.MiB).slice(0, 10);
      log('[site-build] CACHE ' + JSON.stringify(entries));
      return;
    } catch { /* Build-cache paths can be outside the build process namespace. */ }
  }
  log('[site-build] Cache inventory unavailable inside the build container.');
}
