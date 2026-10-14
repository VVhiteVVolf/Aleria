// Local browser verification, never logs into or writes to Firebase.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { sceneFixture } from './scene-fixture.mjs';
import { GUIDE_REGISTRY } from '../modules/guide-registry.mjs';
const { chromium } = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : 'playwright');
const root = fileURLToPath(new URL('../../', import.meta.url)), output = resolve(root, '.codex-temp/gameplay-guide');
await mkdir(output, { recursive: true });
const errors = [], missing = [], checks = [];
const server = createServer(async (req,res) => {
  try {
    if (req.url === '/AleriaAlmanach/guide-scene-test.html') { res.setHeader('Content-Type','text/html;charset=utf-8'); res.end(sceneFixture); return; }
    const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!path.startsWith(root)) { res.writeHead(403); res.end(); return; }
    res.setHeader('Content-Type', ({'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.mjs':'text/javascript;charset=utf-8','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'})[extname(path)] || 'application/octet-stream');
    res.end(path.endsWith('AleriaAlmanach' + sep + 'firebase.js') ? 'window._fbReady=true;' : await readFile(path));
  } catch { res.statusCode = 404; res.end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
  page.on('response', response => { if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) missing.push(response.url()); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  for (const {slug} of GUIDE_REGISTRY) {
    await page.setViewportSize({width:1440,height:1100});
    await page.goto(`${origin}/Gameplay%20Guide/${slug}.html`);
    await page.locator('.hero-art img').evaluate(img => img.decode());
    await page.screenshot({ path: `${output}/${slug}-desktop.png`, fullPage: true });
    const allCount = await page.locator('.combo').count();
    const controlCount = await page.locator('.combo[data-mode="kontrolle"]').count();
    await page.getByRole('button',{name:'Kontrolle',exact:true}).click();
    assert.equal(await page.locator('.combo:not([hidden])').count(),controlCount);
    await page.getByRole('button',{name:'Alle',exact:true}).click();
    assert.equal(await page.locator('.combo:not([hidden])').count(),allCount);
    const library = page.locator('[data-role="arsenal-library"]');
    assert.ok(await library.locator('.cost img').count() > 20);
    const search = library.locator('[data-role="arsenal-search"]');
    await search.fill('unbekannte handlung xyz');
    assert.ok(await library.locator('[data-role="arsenal-empty"]').isVisible());
    await search.fill('');
    const choices = await library.locator('[data-attack-id]').evaluateAll(nodes => nodes.map(n => n.dataset.attackId));
    for (const id of choices) {
      await library.locator(`[data-attack-id="${id}"]`).click();
      assert.equal(await library.locator('[data-attack-id][aria-pressed="true"]').getAttribute('data-attack-id'),id);
      assert.ok((await library.locator('[data-role="attack-preview"]').innerText()).length > 50);
    }
    if (slug === 'ylva') {
      await library.locator('[data-attack-id="technique:ylva-drei-dornen-ein-sturz"]').click();
      const tripleText = await page.locator('#attack-preview').innerText();
      assert.match(tripleText,/1W8/); assert.match(tripleText,/1W6\+5/);
      assert.match(tripleText,/Rettung nach der gesamten Folge/i); assert.match(tripleText,/GES SG 18/);
      await page.locator('#attack-preview').screenshot({path:`${output}/ylva-triple-preview.png`});
      await search.fill('Schafthebel');
      assert.equal(await library.locator('[data-arsenal-row]:not([hidden])').count(),1);
      await library.getByRole('button',{name:/Schafthebel/}).click();
      assert.match(await page.locator('#attack-preview').innerText(),/1W8\+1W4\+5/);
      assert.match(await page.locator('#attack-preview').innerText(),/KRF SG 16/);
      await search.fill('');
      await library.locator('[data-attack-id="technique:ylva-fallender-dorn"]').click();
      const variant = library.locator('[data-action="select-variant"]');
      await variant.selectOption('ylva-speer:foot:two-handed');
      assert.match(await page.locator('#attack-preview').innerText(),/1W20 \+7/);
      assert.match(await page.locator('#attack-preview').innerText(),/2W10\+5/);
      await page.reload();
      assert.equal(await page.locator('[data-action="select-variant"]').inputValue(),'ylva-speer:foot:two-handed');
    } else if (slug === 'gais') {
      await library.locator('[data-attack-id="technique:combat-style-drachentanz-sattelantritt"]').click();
      assert.ok((await library.locator('[data-action="select-variant"] option').allTextContents()).every(text=>text.includes('beritten')));
      await library.locator('[data-attack-id="technique:combat-style-drachentanz-jungdrache-lauernde-klaue"]').click();
      assert.match(await page.locator('#attack-preview').innerText(),/Vorbereiteter Konter/);
      await library.locator('[data-attack-id="technique:gais-wyrmsbrecher"]').click();
      assert.match(await page.locator('#attack-preview').innerText(),/3W12\+1/);
      assert.match(await page.locator('#attack-preview').innerText(),/1W20 \+6/);
      await page.locator('#attack-preview').screenshot({path:`${output}/gais-wyrmsbrecher-preview.png`});
      await library.locator('[data-attack-id="technique:combat-style-drachentanz-jungdrache-entwaffnende-klaue"]').click();
      assert.match(await page.locator('#attack-preview').innerText(),/2W12\+1/);
      assert.match(await page.locator('#attack-preview').innerText(),/KRF SG 15/);
      await page.locator('#attack-preview').screenshot({path:`${output}/gais-enhanced-counter-preview.png`});
    } else if (slug === 'gawain') {
      await library.locator('[data-attack-id="weapon:gawain-draig-knightly-sword"]').click();
      await library.locator('[data-action="select-variant"]').selectOption('gawain-draig-knightly-sword:foot:two-handed');
      assert.match(await page.locator('#attack-preview').innerText(),/1W20 \+4/);
      assert.match(await page.locator('#attack-preview').innerText(),/1W10\+3/);
      await library.locator('[data-attack-id="ability:gawain-liebt-duefte"]').click();
      assert.match(await page.locator('#attack-preview').innerText(),/1× pro Tag/);
      assert.match(await page.locator('#attack-preview').innerText(),/kein passendes Verbrauchsitem/);
      await library.locator('[data-attack-id="condition:gawain-strenge-gerueche"]').click();
      assert.match(await page.locator('#attack-preview').innerText(),/Stinkend/);
    }
    await page.locator('#arsenal').screenshot({path:`${output}/${slug}-arsenal-desktop.png`});
    for (const width of [390,740]) {
      await page.setViewportSize({width,height:844});
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${slug}: overflow ${width}`);
      await page.screenshot({path:`${output}/${slug}-${width}.png`,fullPage:true});
    }
    await page.setViewportSize({width:390,height:844});
    await library.locator('[data-role="arsenal-category"]').selectOption('Passive Fähigkeiten & Herkunft');
    await library.locator('[data-arsenal-row]:not([hidden]) button').first().click();
    assert.match(await page.locator('#attack-preview').innerText(),/Passiv/);
    await page.locator('#attack-preview').screenshot({path:`${output}/${slug}-preview-mobile.png`});
    checks.push({slug,filters:true,selection:choices.length,mobile:true});
  }
  await page.setViewportSize({width:1440,height:1100});
  await page.goto(`${origin}/Gameplay%20Guide/index.html`);
  await page.screenshot({path:`${output}/directory-desktop.png`,fullPage:true});
  await page.getByRole('button',{name:/Haus Bleiddorn/}).click();
  assert.equal(await page.locator('[data-guide-card]:not([hidden])').count(),1);
  assert.equal(await page.locator('[data-guide-card]:not([hidden])').getAttribute('data-guide-card'),'ylva');
  await page.getByRole('button',{name:/Alle Charaktere/}).click();
  await page.locator('[data-role="directory-search"]').fill('Wyrm');
  assert.equal(await page.locator('[data-guide-card]:not([hidden])').count(),1);
  await page.getByRole('button',{name:/Alle Charaktere/}).click();
  await page.getByRole('button',{name:'Gruppen',exact:true}).click();
  assert.match(await page.locator('[data-directory-tree="group"]').innerText(),/keine zusätzlichen Gruppen/);
  await page.getByRole('button',{name:'Häuser & Herkunft',exact:true}).click();
  await page.setViewportSize({width:390,height:844});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth + 1));
  await page.screenshot({path:`${output}/directory-mobile.png`,fullPage:true});
  await page.addInitScript(() => { window._fbReady = true; window._fb = { loadCharacters:async()=>[], loadCreatures:async()=>[], loadComments:async()=>[], subscribeComments:()=>()=>{}, loadCommentTurn:async()=>null }; });
  await page.setViewportSize({width:1440,height:1100});
  await page.goto(`${origin}/AleriaAlmanach/AleriaAlmanach.html`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => typeof window.loadCharacters === 'function' && !!window.AleriaCreatures);
  await page.evaluate(async()=>{ window._charactersLoaded = false; await window.loadCharacters(); await window.AleriaCreatures.reload(); });
  await page.getByRole('button',{name:'Aleria betreten',exact:true}).click();
  for (const {slug,characterId:id} of GUIDE_REGISTRY) {
    await page.evaluate(id=>{window.openCharProfile(id);window.switchCharTab('combat');},id);
    const link = page.locator('#cp-tab-combat .cp-gameplay-guide-link');
    await link.waitFor();
    assert.equal(await link.getAttribute('href'), `/Gameplay%20Guide/${slug}.html`);
    assert.match(await link.getAttribute('aria-label'), /Gameplay Guide/);
    await link.locator('img').evaluate(img=>img.decode());
    await link.scrollIntoViewIfNeeded(); await page.screenshot({path:`${output}/${slug}-bogen-button.png`});
    if (slug === 'ylva') assert.match(await page.locator('#cp-tab-combat').innerText(), /Schafthebel/);
    await page.setViewportSize({width:390,height:844});
    await link.scrollIntoViewIfNeeded(); assert.ok(await link.isVisible());
    await page.screenshot({path:`${output}/${slug}-bogen-button-mobile.png`});
    await page.setViewportSize({width:1440,height:1100});
  }
  await page.evaluate(()=>{window.openCharProfile('person--haus-wyrm--gais-wyrm');window.switchCharTab('inventory');});
  const horse = page.locator('#cp-tab-inventory .ci-companion-card').filter({hasText:'Saithor'}); assert.equal(await horse.count(),1);
  await horse.click(); await page.locator('.ci-companion-modal').waitFor();
  await page.locator('[data-ci-action="open-creature"][data-ci-creature-id="companion-gais-rabenstolz"]').click();
  await page.locator('#creature-profile-overlay.open').waitFor();
  assert.match(await page.locator('#creature-page-overview').innerText(), /Edelsale/);
  await page.screenshot({path:`${output}/rabenstolz-bogen.png`});
  await page.goto(`${origin}/AleriaAlmanach/guide-scene-test.html`);
  await page.waitForFunction(()=>window.guideSceneReady);
  const composer=page.locator('[data-combat-composer]');
  assert.match(await composer.innerText(),/Schafthebel/);
  assert.match(await composer.locator('.combat-action-values').innerText(),/1W8\+1W4\+5/);
  await composer.locator('[data-action="open-action-table"]').click();
  await page.locator('[data-arsenal-card="technique:ylva-schafthebel"] [data-combat-action-option]').click();
  assert.match(await page.locator('.combat-arsenal-detail').innerText(),/Waffenschaden/);
  await page.locator('[data-action="close-action-table"]').click();
  await page.evaluate(()=>window.selectGuideAction('ylva-drei-dornen-ein-sturz'));
  const sequenceValues=await composer.locator('.combat-action-values').innerText();
  for(const formula of ['1W4','1W8','1W6+5']) assert.ok(sequenceValues.includes(formula));
  await page.evaluate(()=>window.selectGuideAction('ylva-aus-der-angriffslinie'));
  assert.equal(await composer.locator('[data-combat-self-target]').count(),1);
  assert.match(await composer.locator('.combat-action-values').innerText(),/Automatisch/);
  await page.locator('[data-action="toggle-comment-combat-profile"]').click();
  const panel=page.locator('[data-comment-combat-profile-panel]');
  await panel.locator('[data-profile-details-key="personal-techniques"]').evaluate(el=>el.open=true);
  const lever=panel.locator('li').filter({hasText:'Schafthebel'});
  assert.match(await lever.innerText(),/Verfügbar/);
  await page.evaluate(()=>window.applyGuidePreparation());
  await panel.locator('li[data-condition-id^="ylva-aus-der-angriffslinie-"]').waitFor();
  assert.match(await lever.innerText(),/Derzeit nicht verfügbar/);
  await page.screenshot({path:`${output}/ylva-scene-prepared.png`});
  await page.evaluate(()=>window.clearGuidePreparation());
  await panel.getByText('Keine temporären Effekte',{exact:true}).waitFor();
  assert.deepEqual(errors,[]); assert.deepEqual(missing,[]);
  await writeFile(`${output}/browser-report.json`,JSON.stringify({checks,characterButtons:true,horseInventoryAndSheet:true,composerAndArsenal:true,miniSceneRefresh:true,errors,missing},null,2));
  console.log(JSON.stringify({checks,errors,missing}));
} finally { await browser?.close(); server.close(); }
