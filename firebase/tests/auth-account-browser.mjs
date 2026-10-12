// Run inside `firebase emulators:exec --only auth` with a demo project.
// This closes and reopens Chromium to check actual browser persistence.
import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { build } from '../../AleriaAlmanach/node_modules/esbuild/lib/main.js';

const address = process.env.FIREBASE_AUTH_EMULATOR_HOST;
assert.match(address || '', /^(localhost|127\.0\.0\.1):\d+$/);
const projectId = 'demo-aleria-account-browser';
const root = path.resolve('.');
const output = path.join(root, '.tmp/firebase-health-20261012/guild-browser');
await mkdir(output, { recursive: true });
const requireFunctions = createRequire(new URL('../functions/package.json', import.meta.url));
const adminApp = requireFunctions('firebase-admin/app').initializeApp({ projectId }, 'browser-check');
const adminAuth = requireFunctions('firebase-admin/auth').getAuth(adminApp);
await build({ stdin: { resolveDir: path.join(root, 'firebase'), contents: `
import { initializeApp } from 'firebase/app';
import * as sdk from 'firebase/auth';
import { createFirebaseAuthSession } from '../AleriaAlmanach/modules/auth/firebase-auth-session.js';
import { createFirebaseAccountActions } from '../AleriaAlmanach/modules/auth/firebase-account-actions.js';
import { mountAccountUi } from '../AleriaAlmanach/modules/auth/account-ui.js';
const auth = sdk.getAuth(initializeApp({ projectId: '${projectId}', apiKey: 'emulator-only' }));
sdk.connectAuthEmulator(auth, 'http://${address}', { disableWarnings: true });
const session = createFirebaseAuthSession({ auth, ...sdk });
window._fbAuth = { getAccess: session.getAccess, ...createFirebaseAccountActions({ auth, session, ...sdk }) };
mountAccountUi(document.querySelector('[data-role="almanach-account"]'));
window.fixtureReady = session.start();
window.fixtureRefresh = async () => { await auth.currentUser.getIdToken(true); await session.refresh(); };
` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(output, 'fixture.js'), logLevel: 'silent' });

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    if (url.pathname === '/fixture') {
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.end('<!doctype html><html lang="de"><head><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="/AleriaAlmanach/styles/account.css"></head><body style="background:#e9deca"><div data-role="almanach-account"></div><script type="module" src="/fixture.js"></script></body></html>');
      return;
    }
    const target = url.pathname === '/fixture.js' ? path.join(output, 'fixture.js') : path.resolve(root, `.${decodeURIComponent(url.pathname)}`);
    if (url.pathname !== '/fixture.js' && (!target.startsWith(path.join(root, 'AleriaAlmanach') + path.sep) || target.includes(`${path.sep}.`))) { response.writeHead(403).end(); return; }
    response.setHeader('Content-Type', target.endsWith('.css') ? 'text/css' : target.endsWith('.webp') ? 'image/webp' : target.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/javascript; charset=utf-8');
    response.end(await readFile(target));
  } catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(18761, '127.0.0.1', resolve));
const profileDirectory = path.join(output, `profile-${Date.now()}`);
let context;
const errors = [];
try {
  context = await chromium.launchPersistentContext(profileDirectory, { headless: true, viewport: { width: 1100, height: 1100 } });
  let page = context.pages()[0];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:18761/fixture');
  await page.evaluate(() => window.fixtureReady);
  const original = await page.evaluate(() => window._fbAuth.getAccess());
  await adminAuth.setCustomUserClaims(original.uid, { aleriaRole: 'editor' });
  await page.evaluate(() => window.fixtureRefresh());
  await page.getByRole('button', { name: /Abenteurer-Konto/ }).click();
  await page.screenshot({ path: path.join(output, 'registration-desktop.png') });
  const form = page.locator('[data-role="account-form"]');
  await form.locator('[name="email"]').fill('browser@example.test');
  await form.locator('[name="password"]').fill('emulator-browser-only-password');
  await form.locator('[name="displayName"]').fill('Gildenfuchs');
  await form.locator('label').filter({ has: page.locator('[value="fenrir"]') }).click();
  await page.getByRole('button', { name: 'Gildenpass anlegen', exact: true }).click();
  await page.getByRole('button', { name: 'Gildenpass aktualisieren', exact: true }).waitFor();
  const secured = await page.evaluate(() => window._fbAuth.getAccess());
  assert.equal(secured.uid, original.uid);
  assert.equal(secured.role, 'editor');
  assert.equal(secured.displayName, 'Gildenfuchs');
  assert.match(secured.photoURL, /fenrir-v1\.webp$/);
  assert.equal(await form.locator('[name="password"]').inputValue(), '');
  await page.screenshot({ path: path.join(output, 'profile-desktop.png') });
  await context.close(); context = null;
  context = await chromium.launchPersistentContext(profileDirectory, { headless: true, viewport: { width: 390, height: 844 } });
  page = context.pages()[0];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:18761/fixture');
  await page.evaluate(() => window.fixtureReady);
  const restored = await page.evaluate(() => window._fbAuth.getAccess());
  assert.equal(restored.uid, original.uid);
  assert.equal(restored.role, 'editor');
  assert.equal(restored.displayName, 'Gildenfuchs');
  assert.equal(restored.photoURL, secured.photoURL);
  await page.getByRole('button', { name: /Gildenfuchs/ }).click();
  const profileForm = page.locator('[data-role="account-profile-form"]');
  await profileForm.locator('[name="displayName"]').fill('Neuer Gildenfuchs');
  await profileForm.locator('label').filter({ has: page.locator('[value="guinevere"]') }).click();
  await page.getByRole('button', { name: 'Gildenpass aktualisieren', exact: true }).click();
  await page.getByRole('button', { name: /Neuer Gildenfuchs/ }).waitFor();
  assert.equal((await page.evaluate(() => window._fbAuth.getAccess())).uid, original.uid);
  await page.screenshot({ path: path.join(output, 'profile-mobile.png') });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth || document.querySelector('dialog').scrollWidth > document.querySelector('dialog').clientWidth);
  assert.equal(overflow, false);
  await page.getByRole('button', { name: 'Abmelden', exact: true }).click();
  await page.getByRole('button', { name: 'Gildenpass anlegen', exact: true }).waitFor();
  assert.equal((await page.evaluate(() => window._fbAuth.getAccess())).anonymous, true);
  await page.locator('.account-modes label').filter({ has: page.locator('[value="login"]') }).click();
  const loginForm = page.locator('[data-role="account-form"]');
  await loginForm.locator('[name="email"]').fill('browser@example.test');
  await loginForm.locator('[name="password"]').fill('wrong-test-password');
  await page.getByRole('button', { name: 'Zurück ans Lagerfeuer', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'E-Mail oder Passwort stimmen nicht.' }).waitFor();
  assert.equal((await page.evaluate(() => window._fbAuth.getAccess())).anonymous, true);
  await loginForm.locator('[name="password"]').fill('emulator-browser-only-password');
  await page.getByRole('button', { name: 'Zurück ans Lagerfeuer', exact: true }).click();
  await page.getByRole('button', { name: 'Gildenpass aktualisieren', exact: true }).waitFor();
  assert.equal((await page.evaluate(() => window._fbAuth.getAccess())).uid, original.uid);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('dialog').isVisible(), false);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ registration: true, originalUidAndEditorRole: true, profileUpdate: true, browserRestartPersistence: true, logoutAnonymous: true, incorrectPasswordPreservesGuest: true, relogin: true, desktop: true, mobile: true, overflow: false, browserErrors: errors }));
} finally {
  await context?.close();
  await new Promise(resolve => server.close(resolve));
  await adminApp.delete();
}
