import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { chromium } = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : 'playwright');
const root = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const out = resolve(root, '.codex-temp/herausforderung');
await mkdir(out, { recursive: true });
// Read-only scene copies are prepared separately; this browser never calls Firebase.
const actors = JSON.parse(await readFile(resolve(out, 'duel-profiles-readonly.json'), 'utf8'));
const history = JSON.parse(await readFile(resolve(out, 'active-duel-readonly.json'), 'utf8')).comments;
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
const fixture = `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="./styles/scene-time.css"><link rel="stylesheet" href="./styles/herausforderung.css"><link rel="stylesheet" href="./styles/skill-checks.css"><link rel="stylesheet" href="./styles/combat.css">
<style>body{margin:0;background:#302c25;color:#ead9b8;font-family:Georgia}main{padding:20px}*{box-sizing:border-box}</style>
<main><button data-herausforderung-action="open">Herausforderung anlegen</button><div id="published"></div></main>
<script>window.testActors=${json(actors)};window.baseHistory=${json(history)};window.testHistory=structuredClone(baseHistory);window.testWrites=[];
window.getCurrentCommentThread=()=>({kind:'session'});window.getCurrentCommentThreadId=()=> 'isolated-combat-browser';
window.getAvailableCommentCharacters=()=>testActors;window.getCachedCommentsForThread=()=>testHistory;
window.getNextCommentOrderKey=()=>Date.now();window.showAppStatus=()=>{};
window.activateDialog=(id,options)=>{const el=document.getElementById(id);el.classList.add('active');el.setAttribute('aria-hidden','false');el.querySelector(options.initialFocus)?.focus()};
window.deactivateDialog=id=>{const el=document.getElementById(id);el.classList.remove('active');el.setAttribute('aria-hidden','true')};
</script><script type="module">
const { getActiveCombatEncounter }=await import('./modules/combat/combat-encounter-model.js');
const { collectHerausforderungApproaches,normalizeHerausforderungEvent }=await import('./modules/herausforderung/herausforderung-model.js');
const { sceneDiceService }=await import('./modules/scene-dice/dice-service.js?v=20261013-performance-v1');
const { parseDamageFormula }=await import('./modules/combat/rules/combat-mvp-rules.js');
window.testRolls=[];
sceneDiceService.roll=async(notation,container,context)=>{
  const parsed=/d20/.test(notation)?{terms:[{diceCount:Number(notation.match(/([0-9]+)d20/)[1]),sides:20}],fixedModifier:Number(notation.match(/[+-][0-9]+$/)?.[0]||0)}:parseDamageFormula(notation);
  const dice=(parsed.terms||[parsed]).flatMap(term=>Array.from({length:term.diceCount},()=>term.sides===20?(context.rollType==='attack'?16:20):Math.ceil(term.sides/2)));
  const keptDice=/k[hl]1/.test(notation)?[dice[0]]:dice;
  const value={id:crypto.randomUUID(),notation,dice,keptDice,natural:dice[0],modifier:parsed.fixedModifier,total:keptDice.reduce((a,b)=>a+b,0)+parsed.fixedModifier};
  testRolls.push({...value,purpose:context.purpose});return value;
};sceneDiceService.rollSilent=(notation,context)=>sceneDiceService.roll(notation,null,context);
await import('./modules/skill-checks/skill-check-controller.js');
await import('./modules/combat/combat-controller.js');
await import('./modules/herausforderung/herausforderung-controller.js');
window.getCommentBackend=async()=>({addHerausforderung:async(thread,text,code,metadata)=>{
  metadata.herausforderung.combatContext={encounterId:getActiveCombatEncounter(testHistory).encounterId};
  testWrites.push(metadata);testHistory.push({id:'browser-challenge-'+testWrites.length,herausforderung:metadata.herausforderung});
}});
window.loadCommentsIntoPage=async()=>{AleriaHerausforderung.setRenderContext(testHistory);document.getElementById('published').innerHTML=testHistory.filter(c=>c.herausforderung).map(c=>AleriaHerausforderung.renderComment(c)).join('')};
window.runOrdered=async order=>{
  const ylva=testActors.find(a=>a.name==='Ylva Wolfshorn'),gais=testActors.find(a=>a.name==='Gais Wyrm');
  const event=normalizeHerausforderungEvent({publicDescription:'Eine Öffnung',combatBound:true,combatContext:{encounterId:getActiveCombatEncounter(baseHistory).encounterId},
    approaches:[{approachId:'trap',preferredSkills:['insight'],difficulty:15,insight:'Ein Köder',rewards:{effects:[{effectId:'focus',name:'Fokus',kind:'buff',durationKind:'combat',mechanics:{attack:2}}]}}]});
  testHistory=[...structuredClone(baseHistory),{id:'ordered',herausforderung:event}];
  const challenge=collectHerausforderungApproaches(testHistory).find(c=>c.commentId==='ordered');
  const skill={...AleriaSkillChecks.getChallengeAttemptSettings(challenge),characterId:ylva.id,text:'Sie liest die Haltung.'};
  const attack={kind:'speech',commentKind:'speech',mechanicMode:'combat',characterId:ylva.id,combatTargetId:gais.id,combatTargetIds:[gais.id],combatActionId:'',combatPaymentConfirmed:true,combatWeaponGrip:'one-handed',combatDistanceMeters:1,text:'Prüfangriff'};
  const segments=order==='before'?[skill,attack]:[attack,skill];
  const submission={threadId:'isolated-combat-browser',characterId:ylva.id,commentSegments:segments};
  assertNeverPublished();
  const deferred=await AleriaSkillChecks.handleSubmission({...submission,deferToCombat:AleriaCombat.hasCombatSegments(segments)});
  if(deferred.commentMetadata.commentSegments.some(s=>s.skillResolution))throw Error('The deferred skill was already rolled.');
  const result=await AleriaCombat.handleSubmission({...submission,commentSegments:deferred.commentMetadata.commentSegments});
  const resolved=result.commentMetadata.commentSegments;
  return {attack:resolved.find(s=>s.combatResolution).combatResolution.attack,skill:resolved.find(s=>s.skillResolution).skillResolution};
};function assertNeverPublished(){if(testWrites.length>1)throw Error('Unexpected domain write');}
window.testReady=true;
</script></html>`;
const types = { '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (path === '/AleriaAlmanach/combat-challenge-test.html') { res.setHeader('Content-Type', 'text/html;charset=utf-8'); res.end(fixture); return; }
    const file = resolve(root, '.' + path);
    if (!file.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
    res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream'); res.end(await readFile(file));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
let browser;
const checks = [], errors = [], missing = [];
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400 && response.url().startsWith('http://127.0.0.1')) missing.push(response.url()); });
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  await page.goto(`http://127.0.0.1:${server.address().port}/AleriaAlmanach/combat-challenge-test.html`);
  await page.waitForFunction(() => window.testReady);
  await page.locator('[data-herausforderung-action="open"]').click();
  const overlay = page.locator('#herausforderung-overlay'), audience = overlay.locator('[data-ha-field="mode"]');
  const field = name => overlay.locator(`[data-herausforderung-field="${name}"]`).first();
  await field('publicDescription').fill('Gais öffnet seine obere Deckung.');
  await field('insight').fill('Er wartet auf einen Fehlangriff.');
  await overlay.locator('[data-skill-id="insight"]').check();
  await audience.selectOption('selected');
  await overlay.locator('[data-herausforderung-action="submit"]').click();
  assert.equal(await audience.getAttribute('aria-invalid'), 'true');
  const ylva = actors.find(a => a.name === 'Ylva Wolfshorn'), gais = actors.find(a => a.name === 'Gais Wyrm');
  await overlay.locator('[data-ha-field="search"]').fill('Ylva');
  assert.equal(await overlay.locator('[data-ha-actor-id]').count(), 1);
  await overlay.locator(`[data-ha-actor-id="${ylva.id}"]`).check();
  await audience.selectOption('combatants');
  assert.ok(await overlay.locator('[data-ha-field="combatBound"]').isDisabled());
  await audience.selectOption('all');
  await audience.selectOption('selected');
  checks.push('audience-three-modes-and-person-search');
  await overlay.locator('[data-hr-editor] > summary').click();
  const rewards = overlay.locator('[data-hr-bundle="rewards"]');
  await rewards.locator('[data-hr-action="add-effect"]').click();
  await rewards.locator('[data-hr-field="durationKind"]').selectOption('combat');
  await rewards.locator('[data-hr-field="targetActorId"]').selectOption(gais.id);
  await rewards.locator('[data-hr-action="add-combat-effect"]').click();
  await rewards.locator('[data-hr-field="combat-type"]').selectOption('damage');
  await rewards.locator('[data-hr-field="combat-targetActorId"]').selectOption(gais.id);
  await rewards.locator('[data-hr-field="combat-formula"]').fill('1W6+2');
  assert.equal(await rewards.locator('[data-hr-field="combat-amount"]').inputValue(), '0');
  await rewards.locator('[data-hr-field="combat-damageType"]').fill('Feuer');
  await rewards.locator('[data-hr-field="combat-magical"]').check();
  checks.push('recipient-damage-formula-and-magic');
  await rewards.locator('[data-hr-action="add-combat-effect"]').click();
  const second = rewards.locator('[data-hr-combat-index="1"]');
  await second.locator('[data-hr-field="combat-type"]').selectOption('spend-resource');
  await second.locator('[data-hr-field="combat-targetActorId"]').selectOption(gais.id);
  await second.locator('[data-hr-field="combat-resourceId"]').selectOption('special-action');
  await second.locator('[data-hr-field="combat-type"]').selectOption('remove-condition');
  const condition = await second.locator('[data-hr-field="combat-conditionId"] option').filter({ hasText: 'Lauernde Klaue' }).getAttribute('value');
  assert.ok(condition); await second.locator('[data-hr-field="combat-conditionId"]').selectOption(condition);
  await second.locator('[data-hr-action="remove-combat-effect"]').click();
  assert.equal(await rewards.locator('[data-hr-combat-index]').count(), 1);
  checks.push('named-resource-and-condition-picker');
  const [download] = await Promise.all([page.waitForEvent('download'), overlay.locator('[data-herausforderung-exchange="draft"]').click()]);
  await download.saveAs(resolve(out, 'combat-editor-export.json'));
  const exported = JSON.parse(await readFile(resolve(out, 'combat-editor-export.json'), 'utf8'));
  assert.deepEqual(exported.challenge.audience, { mode: 'selected', actorIds: [ylva.id] });
  assert.equal(exported.challenge.approaches[0].rewards.combatEffects[0].magical, true);
  assert.equal(exported.challenge.approaches[0].rewards.combatEffects[0].targetActorId, gais.id);
  await overlay.locator('.herausforderung-body').evaluate(el => el.scrollTop = 0);
  await page.screenshot({ path: resolve(out, 'combat-editor-desktop.png') });
  await rewards.locator('.herausforderung-combat-effects').scrollIntoViewIfNeeded();
  await page.screenshot({ path: resolve(out, 'combat-effects-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await overlay.evaluate(el => el.scrollWidth <= el.clientWidth + 1));
  await rewards.locator('.herausforderung-combat-effects').scrollIntoViewIfNeeded();
  assert.ok(await overlay.locator('.herausforderung-body').evaluate(el => el.scrollWidth <= el.clientWidth + 1));
  await page.screenshot({ path: resolve(out, 'combat-effects-mobile.png') });
  await overlay.locator('.herausforderung-body').evaluate(el => el.scrollTop = 0);
  await page.screenshot({ path: resolve(out, 'combat-editor-mobile.png') });
  checks.push('export-preserves-targets-and-responsive-layout');
  await overlay.locator('[data-herausforderung-action="submit"]').click();
  await overlay.waitFor({ state: 'hidden' });
  assert.ok((await page.locator('#published').innerText()).includes('Ylva Wolfshorn'));
  const after = await page.evaluate(() => runOrdered('after'));
  const before = await page.evaluate(() => runOrdered('before'));
  assert.equal(before.attack.modifier, after.attack.modifier + 2);
  assert.ok(before.skill.herausforderungCombatSnapshots[0].after.temporaryConditions.some(c => c.name === 'Fokus'));
  checks.push('real-client-segment-order-before-and-after');
  assert.deepEqual(errors, []); assert.deepEqual(missing, []);
  await writeFile(resolve(out, 'combat-browser-result.json'), JSON.stringify({ passed: true, checks, errors, missing, noFirebaseCalls: true }, null, 2));
  console.log(`Challenge combat browser checks passed: ${checks.length}`);
} finally { await browser?.close(); await new Promise(done => server.close(done)); }
