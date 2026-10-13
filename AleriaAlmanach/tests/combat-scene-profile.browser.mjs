// node AleriaAlmanach/tests/combat-scene-profile.browser.mjs <playwright module path>
// PLAYWRIGHT_EXECUTABLE optionally selects an installed browser. Local data only.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { collectCombatTriggerRules, getCombatRuleApplicationKey } from '../modules/combat/combat-trigger-rules.js';
const { chromium } = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : 'playwright');
const root = resolve(fileURLToPath(new URL('../../', import.meta.url))), out = resolve(root, '.codex-temp/combat-checkup');
await mkdir(out, { recursive: true });
const snapshot = JSON.parse(await readFile(resolve(root, 'CharakterDatenbank/generated/characters.snapshot.json'), 'utf8'));
const record = snapshot.characters.find(c => c.name === 'Nudd Saethwyr');
assert.ok(record);
const base = resolveCombatProfile(record);
const actorId = record.id, threadId = 'local-checkup';
const condition = { id: 'prepared', name: 'Vorbereitete Gegenwehr', active: true,
  durationModel: { kind: 'actor-comments', remainingActorComments: 2 },
  damageGuard: { charges: 1, reduction: 2 }, counterAttack: { enabled: true },
  triggerRules: [{ id: 'penalty', enabled: true, effects: { attackModifier: -1 } }],
  description: 'Test einer sichtbar vorbereiteten Wirkung.' };
const initial = { id: 'status', serverValidatedMechanics: true, combatStatus: { actorId, operation: 'add',
  after: { current: 28, maximum: base.maximumHitPoints, resources: base.resources.map(r => ({ ...r, current: ['action', 'reaction'].includes(r.id) ? 0 : r.current })),
    temporaryConditions: [condition] } } };
const limitedRule = collectCombatTriggerRules(base).find(r => r.frequency === 'scene');
assert.ok(limitedRule);
const spentKey = getCombatRuleApplicationKey({ actorId }, limitedRule) + '@scene:' + threadId;
const fixture = `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="./styles.css"><link rel="stylesheet" href="./styles/comments.css"><link rel="stylesheet" href="./styles/comment-bubbles.css"><link rel="stylesheet" href="./styles/comment-combat-mini-profile.css"><link rel="stylesheet" href="./styles/combat-status.css">
<style>body{margin:20px;background:#ecdcba;color:#382b20;font-family:Georgia}main{display:flex;gap:25px}.comment-entry{display:flex;gap:18px;max-width:100%}.comment-content{flex:1;min-width:0}.comment-portrait-placeholder{background:#493225;color:#ead4a8;border:1px solid #a78440}*{box-sizing:border-box}</style>
<body><main class="comments-scroll comment-tools-visible"><div class="comment-entry left" id="entry"></div></main><script type="module">
let records=${JSON.stringify([record])}, history=${JSON.stringify([initial])};
const threadId=${JSON.stringify(threadId)}, actorId=${JSON.stringify(actorId)};
window.getAvailableCommentCharacters=()=>records;
window.getAvailableCommentCharacterById=id=>records.find(r=>r.id===id);
window.getCachedCommentsForThread=()=>history;
window.getCurrentCommentThread=()=>({kind:'session'});
window.getCurrentCommentThreadId=()=>threadId;
await import('./modules/combat/combat-controller.js');
await import('./modules/comments/comments-combat-mini-profile.js');
function render(index=0){document.getElementById('entry').innerHTML=window.AleriaCommentCombatMiniProfile.renderPortrait({characterId:actorId,threadId,displayName:'Nudd Saethwyr',commentId:'visible',renderIndex:index,portraitMarkup:'<button class="comment-portrait-placeholder">Nudd</button>'})+'<div class="comment-content"><h2>Nudd Saethwyr</h2><p>Lokale Prüfung der aktuellen Szenenanzeige.</p></div>';}
window.updateScene=(next,event='aleria:comments-updated',rerender=false)=>{history=next;if(rerender)render(17);document.dispatchEvent(new CustomEvent(event,{detail:{threadId,comments:history}}));};
window.setAvailable=available=>{records=available?${JSON.stringify([record])}:[];document.dispatchEvent(new CustomEvent('aleria:characters-changed'));};
window.mutateProfile=()=>{records[0].combatProfile.combat.movement=12;document.dispatchEvent(new CustomEvent('aleria:characters-changed'));};
window.testHistory=()=>history;
render();window.testReady=true;
</script></html>`;
const server = createServer(async (req,res) => { try {
  if(req.url === '/AleriaAlmanach/checkup-test.html'){res.setHeader('Content-Type','text/html;charset=utf-8');res.end(fixture);return;}
  const path=resolve(root, '.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  res.setHeader('Content-Type',({'.html':'text/html;charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'})[extname(path)]||'application/octet-stream');
  res.end(await readFile(path));
} catch {res.statusCode=404;res.end();} });
await new Promise(done=>server.listen(0,'127.0.0.1',done));
let browser;
try {
  browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  const errors=[], missing=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.status()>=400 && response.url().startsWith('http://127.0.0.1'))missing.push(response.url());});
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.goto('http://127.0.0.1:'+server.address().port+'/AleriaAlmanach/checkup-test.html');
  await page.waitForFunction(()=>window.testReady);
  await page.locator('[data-action="toggle-comment-combat-profile"]').click();
  const panel=page.locator('[data-comment-combat-profile-panel]');
  await panel.getByText('28/'+base.maximumHitPoints,{exact:true}).waitFor();
  assert.match(await panel.innerText(), /Vorbereitete Gegenwehr/);
  assert.match(await panel.innerText(), /Einmaliger Konter/);
  assert.match(await panel.innerText(), /Angriff -1/);
  assert.match(await panel.locator('li').filter({hasText:'Aktion'}).first().innerText(), /0\/1/);
  await panel.locator('[data-profile-details-key="item-rules"]').evaluate(el=>el.open=true);
  await panel.locator('[data-profile-details-key="condition:prepared"]').evaluate(el=>el.open=true);
  assert.match(await panel.innerText(), /Szene: verfügbar/);
  await panel.evaluate(el=>el.scrollTop=160);
  await page.evaluate(()=>new Promise(done=>requestAnimationFrame(done)));
  const scroll=await panel.evaluate(el=>el.scrollTop);
  const r={actorId,targetId:'opponent',actorName:'Nudd',targetName:'Asgeir',actionType:'attack',resolutionMode:'weapon-attack',
    profileActionKind:'weapon',weapon:{name:'Saethwyr-Dreizack'},attack:{hit:false,naturalRoll:3,diceResults:[3]},
    actorResourceSnapshot:{after:base.resources.map(resource=>({...resource,current:['action','reaction'].includes(resource.id)?0:resource.current}))},
    ruleApplications:[{usedKey:spentKey}],counterAttacks:[{resolution:{actorId:'opponent',targetId:actorId,actorName:'Asgeir',targetName:'Nudd',
      weapon:{name:'Wolfsbeil'},attack:{hit:true,criticalSuccess:true},damage:{total:28},targetSnapshot:{hitPointsBefore:28,hitPointsAfter:0}}}],
    actorHitPointSnapshot:{after:{current:0,maximum:base.maximumHitPoints,temporary:0}}};
  const next=[initial,{id:'attack',serverValidatedMechanics:true,characterId:actorId,commentSegments:[{combatResolution:r}]}];
  await page.evaluate(next=>window.updateScene(next,'aleria:comments-updated',true),next);
  await panel.getByText('0/'+base.maximumHitPoints,{exact:true}).waitFor();
  assert.match(await panel.innerText(), /Kampfunfähig/);
  assert.ok(await panel.locator('[data-profile-details-key="item-rules"]').evaluate(el=>el.open));
  assert.ok(await panel.locator('[data-profile-details-key="condition:prepared"]').evaluate(el=>el.open));
  assert.ok(Math.abs(await panel.evaluate(el=>el.scrollTop)-scroll)<3);
  assert.match(await panel.innerText(), /Szene: verbraucht/);
  await panel.locator('[data-profile-details-key="activity"]').evaluate(el=>el.open=true);
  assert.match(await panel.innerText(), /Konter · Wolfsbeil/);
  assert.match(await panel.innerText(), /TP 28 → 0/);
  await panel.evaluate(el=>el.scrollTop=0);
  await page.screenshot({path:resolve(out,'desktop.png')});
  await page.setViewportSize({width:390,height:844});
  await panel.evaluate(el=>el.scrollTop=0);
  await page.screenshot({path:resolve(out,'mobile-top.png')});
  await panel.evaluate(el=>el.scrollTop=el.scrollHeight);
  await page.screenshot({path:resolve(out,'mobile-effects.png')});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.evaluate(()=>window.setAvailable(false));
  await panel.getByText('Kampfprofil wird geladen. Die Anzeige aktualisiert sich automatisch.',{exact:true}).waitFor();
  await page.evaluate(()=>window.setAvailable(true));
  await panel.getByText('0/'+base.maximumHitPoints,{exact:true}).waitFor();
  const restored=[initial,{id:'recovered',serverValidatedMechanics:true,combatStatus:{actorId,operation:'reset',after:{current:41,maximum:base.maximumHitPoints,temporaryConditions:[]}}}];
  await page.evaluate(next=>window.updateScene(next,'aleria:creatures-changed'),restored);
  await panel.getByText('41/'+base.maximumHitPoints,{exact:true}).waitFor();
  await panel.getByText('Keine temporären Effekte',{exact:true}).waitFor();
  await page.evaluate(()=>window.mutateProfile());
  await panel.getByText('12 m',{exact:true}).waitFor();
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
  const result={actualController:true,actualNuddData:true,desktop:true,mobile:true,remoteUpdate:true,rerenderIndexChange:true,scrollAndDetailsPreserved:true,limitedItemUsage:true,counterDocumentation:true,loadingRecovery:true,creatureRefresh:true,profileCacheInvalidation:true,errors,missing};
  await writeFile(resolve(out,'browser.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
} finally {await browser?.close();await new Promise(done=>server.close(done));}
