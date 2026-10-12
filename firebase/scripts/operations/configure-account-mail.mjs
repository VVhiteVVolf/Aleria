import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const origin = 'https://dieweltvonaleria.netlify.app';
const actionPath = '/AleriaAlmanach/konto-post.html';
const require = createRequire(new URL('../../package.json', import.meta.url));
const cliAuth = require('firebase-tools/lib/auth.js');
const account = cliAuth.getProjectDefaultAccount(process.cwd());
const token = await cliAuth.getAccessToken(account.tokens.refresh_token, ['https://www.googleapis.com/auth/cloud-platform']);
const url = 'https://identitytoolkit.googleapis.com/admin/v2/projects/aleriaprojekt/config';
const headers = { Authorization: `Bearer ${token.access_token}`, 'x-goog-user-project': 'aleriaprojekt', 'Content-Type': 'application/json' };
async function request(target, options = {}) {
  const response = await fetch(target, { ...options, headers, signal: AbortSignal.timeout(30000) });
  const value = await response.json();
  if (!response.ok) {
    const error = new Error(`Authentication configuration HTTP ${response.status}`);
    error.apiCode = String(value.error?.message || '').split(' : ')[0];
    throw error;
  }
  return value;
}
const patch = (mask, body) => request(`${url}?updateMask=${mask.join(',')}`, { method: 'PATCH', body: JSON.stringify(body) });
const before = await request(url);
const notification = before.notification?.sendEmail || {};
const desiredTemplate = {
  senderDisplayName: 'Myrddin Draig · Alerias Gildenpost',
  subject: 'Dein Gildenpass wartet – Myrddin braucht dein Siegel!',
  bodyFormat: 'HTML',
  body: `<div style="background:#faf1df;color:#352b25;font-family:Georgia,serif;padding:24px;max-width:520px;margin:auto;border:3px solid #352b25;border-radius:16px"><img src="${origin}/AleriaAlmanach/public/assets/account/myrddin-v1.webp" alt="Myrddin Draig mit einem magischen Brief" width="192" style="display:block;margin:auto"><h1 style="font-size:26px">Ein Brief! Für dich!</h1><p>Sei gegrüßt, %DISPLAY_NAME%!</p><p>Dein Gildenpass ist fast bereit. Ich habe den Bestätigungszauber dreimal geprüft. Diesmal wird ganz bestimmt niemand zum Frosch.</p><p><a href="%LINK%" style="display:inline-block;background:#e9bf65;color:#352b25;padding:14px 20px;border:2px solid #352b25;border-radius:8px;font-weight:bold">E-Mail mit Myrddins Siegel bestätigen</a></p><p>Damit bestätigst du die Adresse %EMAIL% für deinen Aleria-Zugang.</p><p>Magische Grüße<br><strong>Myrddin Draig</strong><br>Vorübergehend zuständig für funktionierende Postzauber</p><p style="font-size:12px">Falls du keinen Aleria-Zugang angelegt hast, kannst du diese Nachricht ignorieren.</p></div>`
};
let templateMode = 'dry-run';
if (process.argv.includes('--apply')) {
  // Never point live email to a page or script which has not been published.
  const hash = value => createHash('sha256').update(value).digest('hex');
  for (const file of [actionPath, '/AleriaAlmanach/modules/auth/email-action-bootstrap.mjs', '/AleriaAlmanach/modules/auth/email-action-page.js', '/AleriaAlmanach/modules/auth/email-action-controller.js', '/AleriaAlmanach/public/assets/account/myrddin-v1.webp']) {
    const response = await fetch(`${origin}${file}?mail-setup-check=20261012`, { signal: AbortSignal.timeout(30000) });
    if (!response.ok || hash(Buffer.from(await response.arrayBuffer())) !== hash(await readFile(new URL(`../../..${file}`, import.meta.url)))) throw new Error('Account mail page must be published and match the local source first.');
  }
  await writeFile(new URL('../../../.tmp/firebase-health-20261012/account-mail-before.json', import.meta.url), JSON.stringify({ authorizedDomains: before.authorizedDomains, notification: { defaultLocale: before.notification?.defaultLocale, sendEmail: { callbackUri: notification.callbackUri, verifyEmailTemplate: notification.verifyEmailTemplate } } }, null, 2), { flag: 'wx' }).catch(error => { if (error.code !== 'EEXIST') throw error; });
  const domains = [...new Set([...(before.authorizedDomains || []), 'dieweltvonaleria.netlify.app'])];
  await patch(['authorizedDomains'], { authorizedDomains: domains });
  try {
    await patch(Object.keys(desiredTemplate).map(key => `notification.sendEmail.verifyEmailTemplate.${key}`), { notification: { sendEmail: { verifyEmailTemplate: desiredTemplate } } });
    templateMode = 'custom-html';
  } catch (error) {
    if (!['EMAIL_TEMPLATE_UPDATE_NOT_ALLOWED', 'INVALID_EMAIL_TEMPLATE'].includes(error.apiCode)) throw error;
    // Firebase may restrict verification body customization. Keep its secure
    // default body and apply only the supported sender/title branding.
    await patch(['notification.sendEmail.verifyEmailTemplate.senderDisplayName', 'notification.sendEmail.verifyEmailTemplate.subject'], { notification: { sendEmail: { verifyEmailTemplate: { senderDisplayName: desiredTemplate.senderDisplayName, subject: desiredTemplate.subject } } } });
    templateMode = 'firebase-body-with-myrddin-sender';
  }
  await patch(['notification.sendEmail.callbackUri', 'notification.defaultLocale'], { notification: { defaultLocale: 'de', sendEmail: { callbackUri: `${origin}${actionPath}` } } });
}
const after = await request(url);
if (before.signIn?.anonymous?.enabled !== after.signIn?.anonymous?.enabled || before.signIn?.email?.enabled !== after.signIn?.email?.enabled) throw new Error('An unrelated sign-in provider changed.');
console.log(JSON.stringify({ applied: process.argv.includes('--apply'), templateMode, callbackUri: after.notification?.sendEmail?.callbackUri, senderDisplayName: after.notification?.sendEmail?.verifyEmailTemplate?.senderDisplayName, subject: after.notification?.sendEmail?.verifyEmailTemplate?.subject, locale: after.notification?.defaultLocale, websiteAuthorized: after.authorizedDomains?.includes('dieweltvonaleria.netlify.app'), providerSettingsUnchanged: true, emailsSent: 0 }));
