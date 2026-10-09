import { chromium } from 'playwright-core';
import { access, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { startChartQualityServer } from './chart-quality-server.mjs';

const args = Object.fromEntries(process.argv.slice(2).map(value => value.replace(/^--/, '').split('=')));
const root = fileURLToPath(new URL('../../', import.meta.url));
const requestedIds = args.families?.split(',');
const records = FAMILY_REGISTRY.filter(record => record.family?.persons.length && (!requestedIds || requestedIds.includes(record.id)));
if (requestedIds?.some(id => !records.some(record => record.id === id))) throw new Error('Unbekannte oder leere Prüfakte.');
const server = await startChartQualityServer(root);
const results = [];
const deadline = Date.now() + 10 * 60 * 1000;
let browser;
let executablePath = process.env.STAMMBAUM_BROWSER_PATH;
if (!executablePath && process.platform === 'win32') {
  for (const candidate of ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe']) {
    try { await access(candidate); executablePath = candidate; break; } catch {}
  }
}
try {
  browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}), args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('requestfailed', request => { if (request.resourceType() === 'script') console.error(`Prüfmodul nicht geladen: ${request.url()} · ${request.failure()?.errorText}`); });
  page.on('response', response => { if (response.status() >= 400) console.error(`Prüfdatei ${response.status()}: ${response.url()}`); });
  await page.route('**/*', route => new URL(route.request().url()).origin !== server.origin || route.request().resourceType() === 'image' ? route.abort() : route.continue());
  await page.goto(server.origin + '/Stammb%C3%A4ume/tests/chart-quality-fixture.html');
  await page.evaluate(async () => { window.chartQualityFixture = await import('./chart-quality-fixture.js'); });
  for (const record of records) {
    if (Date.now() > deadline) throw new Error('Gesamte Geometrieprüfung überschritt zehn Minuten.');
    const errorCount = errors.length;
    let timeout;
    try {
      const result = await Promise.race([
        page.evaluate(({ id, orientation }) => window.chartQualityFixture.auditFamily(id, orientation), { id: record.id, orientation: args.orientation || 'vertical' }),
        new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('Geometrieprüfung überschritt 30 Sekunden.')), 30000); })
      ]);
      if (errors.length > errorCount) { result.issues.push(...errors.slice(errorCount).map(message => ({ code: 'BROWSER_ERROR', message }))); result.passed = false; }
      results.push(result);
    } catch (error) { results.push({ familyId: record.id, passed: false, issues: [{ code: 'AUDIT_ERROR', message: error.message }] }); }
    finally { clearTimeout(timeout); }
    if (results.length % 25 === 0) console.log(`Stammbaumprüfung: ${results.length}/${records.length}`);
  }
  if (args.report) await writeFile(args.report, JSON.stringify(results, null, 2));
  const failed = results.filter(result => !result.passed);
  console.log(JSON.stringify({ checked: results.length, failed: failed.length, cards: results.reduce((sum, result) => sum + (result.cardCount || 0), 0), failures: failed }, null, 2));
  if (failed.length) process.exitCode = 1;
} finally { await browser?.close(); await server.close(); }
