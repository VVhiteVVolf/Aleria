import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { BUILD_RECEIPT_VERSION } from './site-build-plan.mjs';

export const BUILD_RECEIPT_PATH = 'build-meta/validation.json';

export async function readPublishedReceipt(environment, { fetchImpl = fetch, log = console.log } = {}) {
  if (environment.NETLIFY !== 'true' || !environment.URL || !environment.SITE_ID) return null;
  try {
    const url = new URL('/' + BUILD_RECEIPT_PATH, environment.URL);
    if (url.protocol !== 'https:' || url.username || url.password) throw Error('Invalid publication URL.');
    // The main site URL identifies the last successfully published version, also
    // for preview builds. Failed/queued builds never replace this baseline.
    url.searchParams.set('build', environment.DEPLOY_ID || environment.COMMIT_REF || 'current');
    const response = await fetchImpl(url, { signal: AbortSignal.timeout(8000), cache: 'no-store', redirect: 'error' });
    if (!response.ok) throw Error(`HTTP ${response.status}`);
    const text = await response.text();
    if (text.length > 64 * 1024) throw Error('Oversized validation receipt.');
    return JSON.parse(text);
  } catch {
    log('[site-build] Published validation baseline unavailable; checks will run.');
    return null;
  }
}

export async function readLocalReceipt(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

export async function writeBuildReceipt(root, { siteId, commit, plan, now = new Date().toISOString() }) {
  if (!/^[a-f0-9]{40,64}$/.test(commit || '')) throw Error('Invalid build commit.');
  if (plan.some(task => !Number.isFinite(Date.parse(task.verifiedAt || ''))
    || !/^[a-f0-9]{64}$/.test(task.fingerprint || ''))) throw Error('Unverified build task.');
  const receipt = { version: BUILD_RECEIPT_VERSION, siteId, commit, publishedInputsAt: now,
    tasks: Object.fromEntries(plan.map(task => [task.id, {
      fingerprint: task.fingerprint, verifiedAt: task.verifiedAt || now
    }])) };
  const file = path.join(root, BUILD_RECEIPT_PATH);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(receipt, null, 2) + '\n');
  return receipt;
}
