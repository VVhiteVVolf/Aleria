import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { sanitizeCharacterCombatProfile } from '../../modules/combat/combat-profile-model.js';
import { getSkillIconPresentation, SKILL_ICON_DEFINITIONS } from '../../modules/skill-checks/skill-icon-registry.js';

const { chromium } = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : 'playwright');
const root = fileURLToPath(new URL('../../../', import.meta.url)), output = resolve(root, '.codex-temp/skill-icons');
await mkdir(output, { recursive: true });
const profile = sanitizeCharacterCombatProfile({});
assert.equal(profile.skills.length, 20);
assert.equal(new Set(profile.skills.map(skill => getSkillIconPresentation(skill).id)).size, 20);
assert.ok(profile.skills.every(skill => getSkillIconPresentation(skill).id !== 'custom-skill'));
const manifest = JSON.parse(await readFile(resolve(root, 'AleriaAlmanach/public/assets/skill-icons/manifest.json'), 'utf8'));
assert.equal(manifest.entries.length, 21);
assert.ok(manifest.entries.reduce((sum, entry) => sum + entry.bytes, 0) < 512_000, 'Runtime icons stay below 500 KB in total');
const html = `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="styles/character-combat-profile.css?v=20261015-skill-icons-v1"><link rel="stylesheet" href="styles/combat.css">
<style>body{margin:12px;background:#f1e6c9}*{box-sizing:border-box}#gallery{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin:16px auto;max-width:1100px;padding:20px;background:#ede0bf}#gallery figure{margin:0;text-align:center;font:15px Georgia;color:#49341f}#gallery img{width:128px;height:128px}#gallery figcaption{margin-top:6px}</style>
<section id="gallery"></section><div id="cp-tab-combat"><div id="cp-combat-sheet-root"></div></div><script type="module">
import './modules/characters/character-combat-profile.js?v=20261015-skill-icons-v1';
import { SKILL_ICON_DEFINITIONS } from './modules/skill-checks/skill-icon-registry.js';
document.getElementById('gallery').innerHTML=SKILL_ICON_DEFINITIONS.map(icon=>'<figure><img src="'+icon.src+'" alt=""><figcaption>'+icon.name+'</figcaption></figure>').join('');
AleriaCharacterCombatProfile.init({id:'local-skill-preview',name:'Fertigkeiten-Vorschau',combatProfile:${JSON.stringify(profile)}});window.ready=true;
</script></html>`;
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost'), path = resolve(root, '.' + decodeURIComponent(url.pathname));
    assert.ok(path.startsWith(root));
    res.setHeader('Content-Type', ({ '.html': 'text/html;charset=utf-8', '.js': 'text/javascript;charset=utf-8', '.mjs': 'text/javascript;charset=utf-8', '.css': 'text/css;charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' })[extname(path)] || 'application/octet-stream');
    res.end(url.pathname === '/AleriaAlmanach/skill-icons-test.html' ? html : await readFile(path));
  } catch { res.statusCode = 404; res.end(); }
});
let browser;
const errors = [], missing = [];
try {
  await new Promise(done => server.listen(0, '127.0.0.1', done));
  browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) missing.push(response.url()); });
  const baseUrl = process.argv[3];
  if (baseUrl) {
    await page.route('**/AleriaAlmanach/skill-icons-test.html*', route => route.fulfill({ status: 200, contentType: 'text/html', body: html }));
    await page.goto(new URL('AleriaAlmanach/skill-icons-test.html', baseUrl).href);
  } else {
    await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
    await page.goto(`http://127.0.0.1:${server.address().port}/AleriaAlmanach/skill-icons-test.html`);
  }
  await page.waitForFunction(() => window.ready).catch(error => { console.error(JSON.stringify({ errors, missing })); throw error; });
  const card = page.locator('.cp-sheet-skills'), icons = card.locator('[data-character-skill-icon]');
  assert.equal(await icons.count(), 20);
  assert.deepEqual(await icons.evaluateAll(images => images.map(image => image.dataset.characterSkillIcon)), profile.skills.map(skill => getSkillIconPresentation(skill).id));
  await icons.evaluateAll(images => Promise.all(images.map(image => { image.loading = 'eager'; return image.decode(); })));
  assert.ok(await icons.evaluateAll(images => images.every(image => image.naturalWidth === 96 && image.naturalHeight === 96)));
  const before = await page.evaluate(() => AleriaCharacterCombatProfile.collect().skills);
  const name = card.locator('[data-combat-property="name"]').first();
  await name.fill('Segeln'); assert.equal(await icons.first().getAttribute('data-character-skill-icon'), 'custom-skill');
  await name.fill('Überzeugen'); assert.equal(await icons.first().getAttribute('data-character-skill-icon'), 'persuasion');
  assert.ok(await name.evaluate(input => input === document.activeElement), 'Renaming preserves input focus');
  await name.fill(before[0].name);
  assert.deepEqual(await page.evaluate(() => AleriaCharacterCombatProfile.collect().skills), before, 'Decorating and renaming back preserves skill mechanics and notes');
  await page.locator('#gallery img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  await page.locator('#gallery').screenshot({ path: resolve(output, `${baseUrl ? 'online-' : ''}all-20-icons.png`) });
  await card.screenshot({ path: resolve(output, `${baseUrl ? 'online-' : ''}skills-desktop.png`) });
  await page.locator('#gallery').evaluate(element => element.remove());
  for (const width of [768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await card.scrollIntoViewIfNeeded();
    assert.ok(await card.evaluate(element => element.scrollWidth <= element.clientWidth + 1), `${width}px: table overflow stays inside its scroller`);
    assert.ok(await icons.evaluateAll(images => images.every(image => image.getBoundingClientRect().width === 44 && image.getBoundingClientRect().height === 44)));
    await card.screenshot({ path: resolve(output, `${baseUrl ? 'online-' : ''}skills-${width}.png`) });
  }
  await page.waitForLoadState('networkidle'); assert.deepEqual(errors, []); assert.deepEqual(missing, []);
  const report = { source: baseUrl || 'local', skills: SKILL_ICON_DEFINITIONS.length, fallback: true, liveRename: true, preservedMechanics: true, desktop: true, mobile: true, errors, missing };
  await writeFile(resolve(output, `${baseUrl ? 'online-' : ''}report.json`), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally { await browser?.close(); server.close(); }
