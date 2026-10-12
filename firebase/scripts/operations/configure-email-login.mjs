import { createRequire } from 'node:module';
const require = createRequire(new URL('../../package.json', import.meta.url));
const auth = require('firebase-tools/lib/auth.js');
const account = auth.getProjectDefaultAccount(process.cwd());
const token = await auth.getAccessToken(account.tokens.refresh_token, ['https://www.googleapis.com/auth/cloud-platform']);
const url = 'https://identitytoolkit.googleapis.com/admin/v2/projects/aleriaprojekt/config';
const headers = { Authorization: `Bearer ${token.access_token}`, 'x-goog-user-project': 'aleriaprojekt', 'Content-Type': 'application/json' };
async function request(target, options = {}) {
  const response = await fetch(target, { ...options, headers, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Authentication configuration HTTP ${response.status}`);
  return response.json();
}
const before = await request(url);
if (process.argv.includes('--apply') && (!before.signIn?.email?.enabled || !before.signIn?.email?.passwordRequired)) {
  await request(`${url}?updateMask=signIn.email.enabled,signIn.email.passwordRequired`, { method: 'PATCH', body: JSON.stringify({ signIn: { email: { enabled: true, passwordRequired: true } } }) });
}
const after = await request(url);
console.log(JSON.stringify({ applied: process.argv.includes('--apply'), emailPasswordEnabled: !!after.signIn?.email?.enabled && !!after.signIn?.email?.passwordRequired, anonymousEnabled: after.signIn?.anonymous?.enabled, anonymousUnchanged: before.signIn?.anonymous?.enabled === after.signIn?.anonymous?.enabled, authorizedDomains: after.authorizedDomains, hashConfigurationAvailable: !!after.signIn?.hashConfig }));
