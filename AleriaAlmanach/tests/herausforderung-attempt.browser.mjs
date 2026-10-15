import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { actors } from './support/herausforderung-scenarios.mjs';

const { chromium } = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : 'playwright');
const publicBase = process.argv[3];
const root = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const out = resolve(root, `.codex-temp/herausforderung-attempt${publicBase ? '-online' : ''}`);
await mkdir(out, { recursive: true });
const fixture = `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="./styles/scene-time.css"><link rel="stylesheet" href="./styles/skill-checks.css"><link rel="stylesheet" href="./styles/herausforderung.css"><link rel="stylesheet" href="./styles/herausforderung-attempt.css">
<style>body{margin:0;background:#302c25;color:#ead9b8;font-family:Georgia}main{padding:24px}.test-form{display:none;position:fixed;inset:24px;overflow:auto;z-index:2301;padding:24px;background:#f1e6cf;color:#39281d}.test-form.active{display:block}*{box-sizing:border-box}textarea{width:100%;min-height:70px}</style>
<main><div id="published"></div></main>
<div class="test-form" id="comment-form-overlay" aria-hidden="true"><h2 id="comment-form-title"></h2><select id="test-actor">${actors.map(actor => `<option value="${actor.id}">${actor.name}</option>`).join('')}</select><input id="cf-name"><input id="cf-title"><textarea id="cf-text"></textarea><p id="cf-error"></p><img id="cf-portrait-preview"><div id="cf-manual-fields"></div><button id="cf-manual-toggle"></button><span id="cf-selected-name"></span><input id="cf-char-search"><div id="cf-char-picker"></div><div id="cf-segment-list"></div><div id="cf-preview"></div><button id="cf-submit">Eintragen</button><button id="test-close-form">Abbrechen</button></div>
<script>
var _commentSegments=[],_commentKind='speech',_commentMode='charakter',_selectedCharId=null,_selectedEmoteIdx=null,_selectedImageSetId='',_manualMode=false,_portraitUrl=null,_commentInsertAfterId=null;
var CHARACTER_IMAGE_SET_DEFAULT_ID='',SCENE_TIME_DEFAULT_SEGMENT_SECONDS=30,COMMENT_LANGUAGE_DEFAULT='common';
window.testActors=${JSON.stringify(actors)};window.testThread='isolated-choice';window.testHistory=[];window.testRolls=[];window.testStatuses=[];window.testSaves=0;window.testOpened=0;window.testResult=null;window.testSavedDraft=[];
window.getCurrentCommentThread=()=>({kind:'session'});window.getCurrentCommentThreadId=()=>testThread;
window.getAvailableCommentCharacters=()=>testActors;window.getCachedCommentsForThread=()=>testHistory;
window.showAppStatus=(text,type)=>testStatuses.push({text,type});window.setRichEditorContent=()=>{};window.setCommentMode=(mode)=>{_commentMode=mode};window.setCommentKind=kind=>{_commentKind=kind};
window.setCommentPlayerFilter=()=>{};window.showCommentDraftNote=()=>{};window.setCommentFormCounter=()=>{};window.updateCommentFormPreview=()=>{};window.renderCharPickerInForm=()=>{};
window.restoreCommentDraft=()=>{if(testSavedDraft.length)_commentSegments=structuredClone(testSavedDraft)};
window.makeCommentSegment=(kind='speech',text='',emote=null,side='left',time=30,language='common',color='',settings={})=>({id:crypto.randomUUID(),kind,commentKind:kind,text,mechanicMode:'normal',...settings});
window.persistCommentDraft=()=>{testSaves++;testSavedDraft=structuredClone(_commentSegments)};
window.isCommentFormOpen=()=>document.getElementById('comment-form-overlay').classList.contains('active');
window.renderCommentSegmentList=()=>{const host=document.getElementById('cf-segment-list');host.replaceChildren();for(const segment of _commentSegments){const row=document.createElement('div');row.dataset.segmentId=segment.id;const input=document.createElement('textarea');input.value=segment.text;input.addEventListener('input',()=>{segment.text=input.value});row.append(input);const mechanics=document.createElement('div');mechanics.dataset.segmentMechanicsHost='';row.append(mechanics);host.append(row)}AleriaSkillChecks.mountComposer(host,{segments:_commentSegments,selectedCharacterId:document.getElementById('test-actor').value,threadId:testThread});};
</script><script src="./modules/app/dialog-manager.js"></script><script src="./modules/comments/comments-form.js"></script>
<script type="module">
const { normalizeHerausforderungEvent }=await import('./modules/herausforderung/herausforderung-model.js');
const { sceneDiceService }=await import('./modules/scene-dice/dice-service.js?v=20261013-performance-v1');
sceneDiceService.roll=async(notation)=>{const count=Number(notation.match(/([0-9]+)d20/)[1]),modifier=Number(notation.match(/[+-][0-9]+$/)?.[0]||0);const roll={id:crypto.randomUUID(),dice:Array(count).fill(20),keptDice:[20],natural:20,total:20+modifier};testRolls.push(roll);return roll;};
await import('./modules/skill-checks/skill-check-controller.js');
await import('./modules/herausforderung/herausforderung-controller.js');
const originalOpen=openCommentForm;openCommentForm=()=>{testOpened++;originalOpen()};
window.resetChallenge=(preferred=['persuasion','intimidation','deception','performance','seduction'])=>{testHistory=[{id:'guard',herausforderung:normalizeHerausforderungEvent({title:'Die Torwache',publicDescription:'Eine Wache versperrt den Durchgang.',approaches:[{approachId:'pass',label:'Die Wache lässt dich passieren',preferredSkills:preferred,difficulty:15,insight:'GEHEIM: Die Wache öffnet das Tor.'}]})}];AleriaHerausforderung.setRenderContext(testHistory);document.getElementById('published').innerHTML=AleriaHerausforderung.renderComment(testHistory[0]);};
document.getElementById('test-actor').addEventListener('change',renderCommentSegmentList);
document.getElementById('test-close-form').addEventListener('click',closeCommentForm);
document.getElementById('cf-submit').addEventListener('click',async()=>{try{testResult=await AleriaSkillChecks.handleSubmission({threadId:testThread,characterId:document.getElementById('test-actor').value,commentSegments:_commentSegments});}catch(error){testResult={error:error.message}}});
resetChallenge();window.testReady=true;
</script></html>`;
const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.json': 'application/json', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (path === '/AleriaAlmanach/attempt-test.html') { res.setHeader('Content-Type', 'text/html;charset=utf-8'); res.end(fixture); return; }
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
  const host = publicBase ? new URL(publicBase).hostname : '127.0.0.1';
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400 && new URL(response.url()).hostname === host && !response.url().endsWith('/favicon.ico')) missing.push(response.url()); });
  await page.route('**/*', route => new URL(route.request().url()).hostname === host ? route.continue() : route.abort());
  if (publicBase) await page.route('**/AleriaAlmanach/attempt-test.html*', route => route.fulfill({ status: 200, contentType: 'text/html', body: fixture }));
  await page.goto(publicBase ? new URL('AleriaAlmanach/attempt-test.html', publicBase).href : `http://127.0.0.1:${server.address().port}/AleriaAlmanach/attempt-test.html`);
  await page.waitForFunction(() => window.testReady);
  const attempt = page.locator('#published [data-herausforderung-action="attempt"]');
  const picker = page.locator('#herausforderung-attempt-overlay'), form = page.locator('#comment-form-overlay');
  const choice = skill => picker.locator(`[data-ha-attempt-action="choose"][data-skill-id="${skill}"]`);
  await attempt.click();
  assert.equal(await picker.locator('[data-ha-attempt-action="choose"]').count(), 5);
  assert.ok(!(await picker.innerText()).includes('GEHEIM'));
  assert.equal(await page.evaluate(() => testRolls.length + testOpened + testSaves), 0);
  await choice('persuasion').focus(); await page.keyboard.press('Escape');
  await picker.waitFor({ state: 'hidden' });
  assert.ok(await attempt.evaluate(element => element === document.activeElement));
  await attempt.click();
  await picker.locator('footer [data-ha-attempt-action="close"]').focus();
  await page.keyboard.press('Tab');
  assert.ok(await picker.locator('header button').evaluate(element => element === document.activeElement));
  await page.screenshot({ path: resolve(out, 'skill-choice-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await picker.locator('.herausforderung-attempt-card').evaluate(element => element.scrollWidth <= element.clientWidth + 1));
  await page.screenshot({ path: resolve(out, 'skill-choice-mobile.png') });
  await picker.locator('footer button').click();
  checks.push('all-five-skills-visible-no-roll-before-selection-keyboard-and-mobile');
  await page.setViewportSize({ width: 1440, height: 1000 });

  const kinds = { persuasion: 'speech', intimidation: 'shout', deception: 'performance', performance: 'performance', seduction: 'flirt' };
  for (const actor of actors) for (const [skillId, kind] of Object.entries(kinds)) {
    await page.evaluate(() => { testSavedDraft=[];testResult=null;resetChallenge(); });
    const before = await page.evaluate(() => testRolls.length);
    await attempt.click();
    await choice(skillId).click();
    await form.waitFor({ state: 'visible' });
    await page.waitForFunction(() => document.querySelector('[data-skill-input="skillId"]:checked'));
    await page.locator('#test-actor').selectOption(actor.id);
    assert.equal(await page.locator('[data-skill-input="skillId"]:checked').inputValue(), skillId);
    const settings = await page.evaluate(() => ({ kind:_commentSegments.at(-1).kind, target:_commentSegments.at(-1).skillTargetChallengeId }));
    assert.equal(settings.kind, kind); assert.equal(settings.target, 'herausforderung:guard:pass');
    assert.equal(await page.evaluate(() => testRolls.length), before);
    await form.locator('#cf-segment-list textarea').fill(`${actor.name} versucht es mit ${skillId}.`);
    await form.locator('#cf-submit').click();
    await page.waitForFunction(() => testResult);
    const result = await page.evaluate(() => testResult);
    assert.ok(!result.error, result.error);
    const resolution = result.commentMetadata.commentSegments.at(-1).skillResolution;
    assert.equal(resolution.skillId, skillId); assert.equal(resolution.actorId, actor.id);
    assert.equal(resolution.affinityModifier, 0); assert.equal(resolution.targetChallengeId, settings.target);
    assert.equal(await page.evaluate(() => testRolls.length), before + 1);
    await form.locator('#test-close-form').click();
    checks.push(`${actor.name}-${skillId}-real-composer-and-roll`);
  }

  const opened = await page.evaluate(() => testOpened);
  await attempt.click();
  await page.evaluate(() => { testHistory[0].herausforderung.approaches[0].preferredSkills=['persuasion']; });
  await choice('seduction').click();
  assert.equal(await page.evaluate(() => testOpened), opened);
  assert.match(await page.evaluate(() => testStatuses.at(-1).text), /nicht mehr verfügbar/);
  await page.evaluate(() => resetChallenge());
  await attempt.click();
  await page.evaluate(() => { testThread='another-scene'; });
  await choice('persuasion').click();
  assert.equal(await page.evaluate(() => testOpened), opened);
  assert.match(await page.evaluate(() => testStatuses.at(-1).text), /Szene wurde gewechselt/);
  await page.evaluate(() => { testThread='isolated-choice';resetChallenge(); });
  await attempt.click();
  await page.evaluate(() => { testHistory.push({id:'solved',commentSegments:[{skillResolution:{targetChallengeId:'herausforderung:guard:pass',outcome:'success',herausforderungTier:'erfolg'}}]}); });
  await choice('persuasion').click();
  assert.equal(await page.evaluate(() => testOpened), opened);
  assert.match(await page.evaluate(() => testStatuses.at(-1).text), /Ansatz ist nicht mehr verfügbar/);
  checks.push('changed-skill-scene-and-solved-approach-rechecked-before-composer');
  await page.evaluate(() => resetChallenge(['insight']));
  await attempt.click();
  assert.equal(await picker.locator('[data-ha-attempt-action="choose"]').count(), 1);
  await page.waitForFunction(() => document.activeElement?.matches('[data-ha-attempt-action="choose"][data-skill-id="insight"]'));
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => [...document.querySelectorAll('[data-skill-input="skillId"]:checked')].at(-1)?.value==='insight');
  assert.equal(await page.evaluate(() => _commentSegments.at(-1).kind), 'thought');
  assert.equal(await page.evaluate(() => _commentSegments[0].skillId), 'seduction', 'The existing restored attempt remains intact');
  checks.push('one-skill-explicit-keyboard-choice');
  assert.deepEqual(errors, []); assert.deepEqual(missing, []);
  await writeFile(resolve(out, 'browser-result.json'), JSON.stringify({ passed: true, checks, errors, missing, productionWrites: 0, source: publicBase || 'local' }, null, 2));
  console.log(JSON.stringify({ passed: true, checks: checks.length, productionWrites: 0 }));
} finally { await browser?.close(); await new Promise(done => server.close(done)); }
