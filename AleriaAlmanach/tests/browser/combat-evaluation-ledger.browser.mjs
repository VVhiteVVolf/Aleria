import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const { chromium } = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : 'playwright');
const root = fileURLToPath(new URL('../../../', import.meta.url));
const output = resolve(root, '.codex-temp/evaluation-ledger');
await mkdir(output, { recursive: true });

// Reproduce the long expired-counter entry in a half-width ledger panel.
const resolution = {
  actorId: 'ylva', actorName: 'Ylva Wolfshorn', targetId: 'gais', targetName: 'Gais Wyrm',
  resolutionMode: 'automatic',
  targetConditionSnapshot: { before: [{
    id: 'counter', name: 'Lauernde Klaue', duration: 'Bis zum Ende des nächsten eigenen Beitrags',
    description: 'Lauert auf den nächsten verfehlten Waffen- oder Technikangriff: ein automatischer Gegenangriff mit Vorteil und normalem Schaden der aktuell geführten Waffe. Einmalig, bis zum Ende des nächsten eigenen Beitrags; keine Konterketten. Treffer des Gegners lösen den Konter nicht aus.'
  }], after: [] },
  actorResourceSnapshot: { changes: [{ resourceId: 'action', name: 'Aktion', before: 1, after: 0 }] },
  actorInventorySnapshot: { ammunitionUse: { name: 'Wolfshorn-Jagdpfeile', before: 12, after: 11 } }
};
const secondary = {
  resolutionMode: 'automatic',
  secondarySaves: [{ attributeKey: 'dexterity', total: 12, dc: 18, succeeded: false, timing: 'after-sequence', diceResults: [9], modifier: 3 }],
  ruleApplications: [{ sourceActorName: 'Gais Wyrm', ruleName: 'Geschlossene Schuppe', effects: [] }],
  mechanicNotes: ['Einmalige Vorbereitungen werden erst durch den vorgesehenen Auslöser verbraucht.']
};
const html = `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="styles/combat.css?v=20261015-ledger-layout-v3">
<style>body{margin:16px;background:#eee4ce}*{box-sizing:border-box}main{max-width:840px;margin:auto}.combat-evaluation{padding:12px}</style>
<main><div id="expired-counter" class="combat-evaluation" data-state="miss"></div><div id="other-records" class="combat-evaluation" data-state="self"></div></main>
<script type="module">
import { renderEvaluationLedger } from './modules/combat/ui/combat-evaluation-ledger.js?v=20261015-ledger-layout-v3';
document.getElementById('expired-counter').innerHTML=renderEvaluationLedger(${JSON.stringify(resolution)});
document.getElementById('other-records').innerHTML=renderEvaluationLedger(${JSON.stringify(secondary)},{summarizeRuleEffects:()=>'+1 RK bis zum Ende des nächsten eigenen Beitrags; nur die stärkste Haltung zählt.'});
window.ready=true;
</script></html>`;

const contentTypes = { '.html': 'text/html;charset=utf-8', '.js': 'text/javascript;charset=utf-8', '.css': 'text/css;charset=utf-8', '.png': 'image/png', '.webp': 'image/webp' };
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const path = resolve(root, '.' + decodeURIComponent(url.pathname));
    assert.ok(path.startsWith(root));
    res.setHeader('Content-Type', contentTypes[extname(path)] || 'application/octet-stream');
    res.end(url.pathname === '/AleriaAlmanach/ledger-test.html' ? html : await readFile(path));
  } catch { res.statusCode = 404; res.end(); }
});
let browser;
const errors = [], missing = [], checks = [];
try {
  await new Promise(done => server.listen(0, '127.0.0.1', done));
  browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) missing.push(response.url()); });
  const baseUrl = process.argv[3];
  if (baseUrl) {
    // Only the fixture HTML is intercepted; all CSS and modules come from the published site.
    await page.route('**/AleriaAlmanach/ledger-test.html*', route => route.fulfill({ status: 200, contentType: 'text/html', body: html }));
    await page.goto(new URL('AleriaAlmanach/ledger-test.html', baseUrl).href);
  } else {
    await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
    await page.goto(`http://127.0.0.1:${server.address().port}/AleriaAlmanach/ledger-test.html`);
  }
  await page.waitForFunction(() => window.ready);
  for (const { label, viewport, cardWidth } of [
    { label: 'desktop', viewport: 1440, cardWidth: 840 },
    { label: 'narrow-embedded', viewport: 1440, cardWidth: 620 },
    { label: 'tablet', viewport: 768, cardWidth: 736 },
    { label: 'mobile', viewport: 390, cardWidth: 358 },
    { label: 'small-mobile', viewport: 320, cardWidth: 288 }
  ]) {
    await page.setViewportSize({ width: viewport, height: 900 });
    await page.locator('main').evaluate((element, width) => element.style.maxWidth = `${width}px`, cardWidth);
    const ledger = page.locator('#expired-counter');
    const name = ledger.locator('.combat-evaluation-record-list li > b').first();
    const bounds = await name.boundingBox();
    const lineHeight = await name.evaluate(element => parseFloat(getComputedStyle(element).lineHeight));
    assert.ok(bounds.width > 150, `${label}: condition name has usable line width (${bounds.width}px)`);
    assert.ok(bounds.height <= lineHeight * 2 + 1, `${label}: condition name stays within two lines (${bounds.height}px)`);
    const panels = await ledger.locator('.combat-evaluation-record-section').all();
    const state = await panels[0].boundingBox(), resources = await panels[1].boundingBox();
    assert.ok(state.height < 350, `${label}: no vertically fragmented condition name`);
    assert.ok(resources.height < 150, `${label}: resource panel is not stretched to match prose`);
    for (const item of await page.locator('.combat-evaluation-record-list li').all()) {
      const title = await item.locator(':scope > b').boundingBox();
      if (title) assert.ok(title.width > 100, `${label}: save and rule headings remain readable`);
      assert.ok(await item.evaluate(element => element.scrollWidth <= element.clientWidth + 1), `${label}: record fits panel`);
    }
    for (const value of await ledger.locator('.combat-evaluation-record-list li > span').all()) {
      if (!/ → /.test(await value.innerText())) continue;
      const valueBounds = await value.boundingBox();
      const valueLineHeight = await value.evaluate(element => parseFloat(getComputedStyle(element).lineHeight));
      assert.ok(valueBounds.height <= valueLineHeight + 1, `${label}: resource values remain on one line`);
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${label}: no page overflow`);
    await page.locator('main').screenshot({ path: resolve(output, `${baseUrl ? 'online-' : ''}${label}.png`) });
    checks.push(label);
  }
  await page.waitForLoadState('networkidle');
  assert.deepEqual(errors, []); assert.deepEqual(missing, []);
  const report = { source: baseUrl || 'local', checks, errors, missing };
  await writeFile(resolve(output, `${baseUrl ? 'online-' : ''}report.json`), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally { await browser?.close(); server.close(); }
