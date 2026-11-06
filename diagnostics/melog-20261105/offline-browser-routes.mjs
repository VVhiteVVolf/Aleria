import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Actual workspace controllers remain intact. Firebase's existing disabled
// option is used; static SDK declarations exist only so ESM can link locally.
// Any unexpected SDK invocation fails the browser test immediately.
export async function installOfflineFamilyBrowserRoutes({ context, root, origin }) {
  const sdkExports = new Map();
  for (const source of [
    'firebase-platform/firebase-client.js', 'firebase-platform/firebase-auth.js',
    'almanach-bridge/almanach-character-repository.js', 'family-sync/firestore-family-repository.js',
    'family-assets/firebase-asset-repository.js'
  ]) {
    const text = await readFile(resolve(root, `Stammbäume/assets/js/modules/${source}`), 'utf8');
    for (const match of text.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"](https:\/\/www\.gstatic\.com\/firebasejs\/[^'"]+)['"]/g)) {
      const names = sdkExports.get(match[2]) || new Set();
      match[1].split(',').map(name => name.trim()).filter(Boolean).forEach(name => names.add(name));
      sdkExports.set(match[2], names);
    }
  }
  await context.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (sdkExports.has(url.href)) return route.fulfill({ contentType: 'text/javascript', body: [...sdkExports.get(url.href)].map(name => `export const ${name} = () => { throw new Error('Firebase SDK is disabled in the local Melog browser fixture'); };`).join('\n') });
    if (url.origin === origin && request.method() === 'GET' && url.pathname.endsWith('/Stammbaum.html')) {
      const response = await route.fetch();
      const html = (await response.text()).replace('<meta name="aleria-firebase-enabled" content="true">', '<meta name="aleria-firebase-enabled" content="false">');
      return route.fulfill({ response, body: html });
    }
    return url.origin === origin && request.method() === 'GET' ? route.continue() : route.abort();
  });
  return { sdkModules: sdkExports.size, externalRequestsBlocked: true, writesBlocked: true };
}
