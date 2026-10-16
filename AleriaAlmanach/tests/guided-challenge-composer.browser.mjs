import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { person, gradedEvent, encounterComment } from './fixtures/graded-challenge-fixtures.mjs';
const { chromium } = await import(pathToFileURL(resolve(process.argv[2])).href);
const root = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const out = resolve(root, '.codex-temp/guided-challenge-browser'); await mkdir(out, { recursive: true });
const helper = person('helper');
helper.combatProfile.quirks = [{ id: 'guidance', name: 'Taktische Hinweise', active: true, triggerRules: [
  { id: 'help-insight', name: 'Auf die Absicht hinweisen', activation: 'reaction', phase: 'pre-roll', sourceRelation: 'ally', actionKinds: ['skill'], skillIds: ['insight'], effects: { skillModifier: 2 } },
  { id: 'defend', name: 'In die Angriffslinie treten', activation: 'reaction', phase: 'pre-roll', sourceRelation: 'ally', actionKinds: ['skill'], effects: { defenseModifier: 2 } }
] }];
const outsider = { ...structuredClone(helper), id: 'outsider', name: 'Nicht in diesem Kampf' };
const actors = [person('reader'), person('opponent'), helper, outsider];
const start = encounterComment();
start.combatEncounter.participants.push({ actorId: 'helper', partyId: 'a' });
const event = gradedEvent(); event.combatContext = { encounterId: 'duel' };
const fixture = `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="./styles/skill-checks.css?v=20261016-guided-checks-v1"><style>body{margin:0;padding:12px;background:#eee4ce;font:16px Georgia}*{box-sizing:border-box}</style><div id="segments"><div data-segment-id="attempt"><div data-segment-mechanics-host></div></div></div><script>
window.actors=${JSON.stringify(actors)};window.historyFixture=${JSON.stringify([{ id: 'start', ...start }])};
window.challenge={id:'herausforderung:challenge:read-move',authorKey:'event',authorName:'Seinen nächsten Zug lesen',preferredSkills:['perception','investigation','insight'],difficulty:18,visibleText:'Gais’ Vorbereitung deuten',defenseMode:'fixed',source:'herausforderung'};
window.segment={id:'attempt',kind:'thought',mechanicMode:'skill',skillId:'insight',skillCustomModifier:99,skillTargetChallengeId:challenge.id};
window.getAvailableCommentCharacters=()=>actors;window.getCachedCommentsForThread=()=>historyFixture;window.persistCommentDraft=()=>{};window.AleriaHerausforderung={collectApproaches:()=>[challenge]};
</script><script type="module">await import('./modules/skill-checks/skill-check-controller.js?v=20261016-guided-checks-v1');window.mount=()=>AleriaSkillChecks.mountComposer(document.getElementById('segments'),{segments:[segment],selectedCharacterId:'reader',threadId:'scene'});mount();window.ready=true;</script></html>`;
const types = { '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = createServer(async (request, response) => { try {
  const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  if (path === '/AleriaAlmanach/guided-test.html') { response.setHeader('Content-Type', 'text/html;charset=utf-8'); response.end(fixture); return; }
  const file = resolve(root, '.' + path); assert.ok(file.startsWith(root + sep));
  response.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream'); response.end(await readFile(file));
} catch { response.writeHead(404); response.end(); } });
await new Promise(done => server.listen(0, '127.0.0.1', done)); let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }); const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const origin = process.argv[3] || `http://127.0.0.1:${server.address().port}`;
  if (process.argv[3]) await page.route(origin + '/AleriaAlmanach/guided-test.html', route => route.fulfill({ contentType: 'text/html', body: fixture }));
  await page.goto(origin + '/AleriaAlmanach/guided-test.html'); await page.waitForFunction(() => window.ready);
  assert.equal(await page.locator('[data-skill-input="customModifier"]').count(), 0);
  assert.equal(await page.evaluate(() => segment.skillCustomModifier), 0);
  assert.equal(await page.locator('.skill-choice-preferred').count(), 3);
  assert.equal(await page.locator('[data-skill-input="skillId"]:checked').count(), 1);
  assert.equal(await page.locator('.skill-choice-selected').innerText(), '✓ Für diesen Wurf gewählt');
  const support = page.locator('[data-skill-rule-toggle]'); assert.equal(await support.count(), 1); assert.equal(await support.isChecked(), true);
  assert.match(await page.locator('[data-skill-automatic-value]').innerText(), /W20 \+ 2/);
  assert.match(await page.locator('.skill-check-support').innerText(), /1 Reaktion/);
  assert.doesNotMatch(await page.locator('.skill-check-support').innerText(), /Angriffslinie|Nicht in diesem Kampf/);
  const color = await page.locator('.skill-choice-preferred .skill-choice-face').first().evaluate(el => getComputedStyle(el).borderColor);
  assert.equal(color, 'rgb(140, 47, 41)');
  await support.uncheck(); assert.equal(await support.isChecked(), false);
  assert.match(await page.locator('[data-skill-automatic-value]').innerText(), /W20 \+ 0/);
  await page.evaluate(() => mount()); assert.equal(await support.isChecked(), false);
  await page.locator('.skill-choice').filter({ has: page.locator('[value="perception"]') }).click(); assert.equal(await support.count(), 0);
  assert.equal(await page.locator('.skill-choice-preferred').count(), 3);
  await page.locator('.skill-choice').filter({ has: page.locator('[value="insight"]') }).click(); assert.equal(await support.isChecked(), true);
  await page.screenshot({ path: resolve(out, 'desktop.png') });
  await page.setViewportSize({ width: 390, height: 1000 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.screenshot({ path: resolve(out, 'mobile.png'), fullPage: true });
  assert.deepEqual(errors, []);
  const result = { passed: true, freeModifierRemoved: true, preferredSkills: 3, singleRollChoice: true, relevantSupportPreselected: true, irrelevantAndAbsentExcluded: true, deselectionRetained: true, automaticValueUpdates: true, mobileFits: true, errors, productionWrites: 0 };
  await writeFile(resolve(out, process.argv[3] ? 'production-result.json' : 'result.json'), JSON.stringify(result, null, 2)); console.log(JSON.stringify(result));
} finally { await browser?.close(); await new Promise(done => server.close(done)); }
