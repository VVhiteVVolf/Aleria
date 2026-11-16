import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { buildLandfamilienEntries } from '../modules/gwynthor-landfamilien/landfamilien-module.mjs';
import { HOF_STAFF } from '../../shared/tirfelyn-hof/hof-residents.mjs';
import { HOF_ANIMALS } from '../../shared/tirfelyn-hof/hof-animals.mjs';
import { HOF_POIS, HOF_MAPPED_POIS, HOF_MAP_ID } from '../../shared/tirfelyn-hof/hof-pois.mjs';
import { HOF_SCENE_RELOCATIONS, hofSceneDestination } from '../../shared/tirfelyn-hof/hof-areas.mjs';
import { hofMapMarker } from '../../Karten/modules/tirfelyn-hof/hof-markers.mjs';

const entry = buildLandfamilienEntries()[0];
const farmEntries = buildLandfamilienEntries().filter(entry => entry.id.startsWith('tirfelyn-hof'));
const navigationOnly = process.env.TIRFELYN_BROWSER_MODE === 'navigation';
const mapOnly = process.env.TIRFELYN_BROWSER_MODE === 'map';
const output = resolve(process.env.TIRFELYN_BROWSER_OUTPUT || `diagnostics/tirfelyn-hof-reorganisation-20261116/browser-${Date.now()}`);
await mkdir(output, { recursive: true });
const preview = await openVenueBrowserPreview('tirfelyn-hof');
const { page } = preview, checks = [], actorChecks = [], screenshots = [], navigationChecks = [], peopleChecks = [], mapErrors = [];
const openedPages = [];
let mapCards = 0;
const capture = async (name, target = page) => {
  const path = resolve(output, `${name}.png`); await target.screenshot({ path }); screenshots.push(path);
};
let mapPage;
try {
  await page.evaluate(async () => {
    window.__tirfelynWrites = 0;
    window._fb = { ...getLocalCommentBackend(), _localFallback: false, loadCreatures: async () => [],
      addComment: async () => { window.__tirfelynWrites++; throw Error('Testwrites gesperrt'); } };
    _fbReady = true;
    await window.AleriaCreatures.reload();
    await loadCharacters();
  });
  const actualEntry = await page.evaluate(() => findCurrentSectionByEntryId('tirfelyn-hof')?.entry);
  assert.equal(actualEntry.pages.length, 15, 'Die tatsächlich registrierte Anwendung muss die neue Hofaufteilung laden.');
  const roundtrip = await page.evaluate(entry => sanitizeModuleEntry(JSON.parse(JSON.stringify(sanitizeModuleEntry(entry)))), entry);
  assert.equal(roundtrip.pages.length, 15);
  assert.deepEqual(roundtrip.pages.map(page => page.commentThreadKey), entry.pages.map(page => page.commentThreadKey));
  for (const model of farmEntries) {
    const registered = await page.evaluate(id => findCurrentSectionByEntryId(id)?.entry, model.id);
    assert.equal(registered.pages.length, model.pages.length);
    const normalized = await page.evaluate(entry => sanitizeModuleEntry(JSON.parse(JSON.stringify(sanitizeModuleEntry(entry)))), model);
    assert.deepEqual(normalized.commentThreadAliases, model.commentThreadAliases);
  }
  for (const relocation of HOF_SCENE_RELOCATIONS) {
    const target = await page.evaluate(thread => findCommentThreadDestination(thread, getValidSections()), relocation.oldThreadId);
    assert.equal(target.entry.id, relocation.entryId);
    assert.equal(target.threadId, relocation.threadId);
  }

  const layouts = navigationOnly ? [] : [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }], ['narrow', { width: 320, height: 780 }]];
  for (const [layout, viewport] of layouts) {
    await page.setViewportSize(viewport);
    if (!mapOnly) {
    for (const moduleEntry of farmEntries) for (const [index, model] of moduleEntry.pages.entries()) {
      await preview.openPage(moduleEntry, index);
      await preview.decodeImages('#modal-overlay img[src*="tirfelyn-hof"], #modal-overlay img[src*="gwynthor-landfamilien"]');
      if (model.hierarchyPage) {
        for (const [treeIndex, tree] of model.hierarchy.trees.entries()) {
          await page.locator('#modal-overlay [data-hierarchy-tree-tab]').nth(treeIndex).click();
          assert.equal(await page.locator('#modal-overlay [data-hierarchy-tree-panel].active .hierarchy-node-card').count(), tree.levels.flatMap(level => level.nodes).length);
          await preview.decodeImages('#modal-overlay [data-hierarchy-tree-panel].active img');
          if (['hof-wald', 'hof-muehle', 'hof-tiere'].includes(tree.id)) await capture(`${layout}-hierarchie-${tree.id}`);
        }
      }
      if (model.sessionPage) {
        assert.equal(await page.evaluate(() => getCurrentCommentThreadId()), `${moduleEntry.id}::session:${model.commentThreadKey}`);
        const toggle = page.locator('#modal-overlay .session-intro-toggle');
        const initiallyOpen = await page.locator('#modal-overlay .session-intro').evaluate(details => details.open);
        await toggle.click(); assert.equal(await page.locator('#modal-overlay .session-stage-copy').isVisible(), !initiallyOpen);
        await toggle.click(); assert.equal(await page.locator('#modal-overlay .session-stage-copy').isVisible(), initiallyOpen);
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), `${layout}: ${model.pageTitle}`);
      checks.push({ layout, module: moduleEntry.id, page: index, title: model.pageTitle, thread: model.commentThreadKey });
      if ((moduleEntry.id === entry.id && [0, 6, 7, 14].includes(index)) || (moduleEntry.id !== entry.id && index === 0))
        await capture(`${layout}-${moduleEntry.id}-page-${index}`);
    }

    await preview.openPage(entry, 8);
    assert.equal(await page.evaluate(() => Number(getComputedStyle(document.getElementById('firebase-sync-status')).zIndex)
      < Number(getComputedStyle(document.getElementById('modal-overlay')).zIndex)), true);
    await page.locator('#modal-overlay [data-action="open-comment-form"]').click();
    await page.waitForFunction(() => isCommentFormActorsReady() && document.querySelector('#cf-char-picker .cf-char-option'));
    await page.locator('#cf-mode-char').click();
    for (const actor of [...HOF_STAFF, ...HOF_ANIMALS]) {
      if (actor.id === HOF_ANIMALS[0].id) await page.locator('#cf-mode-creature').click();
      await page.locator('#cf-char-search').fill(actor.name);
      const option = page.locator(`#cf-char-picker [data-id="${actor.id}"]`);
      await option.click();
      await preview.decodeImages(`#cf-char-picker [data-id="${actor.id}"] img`);
      assert.equal(await page.evaluate(() => _selectedCharId), actor.id);
      assert.ok((await page.locator('#cf-selected-name').innerText()).includes(actor.name));
      actorChecks.push({ layout, id: actor.id });
    }
    await capture(`${layout}-avatarwahl`);
    await page.locator('#comment-form-overlay [data-action="close-comment-form"]').click();
    await page.locator('#comment-form-overlay').waitFor({ state: 'hidden' });
    for (const actor of HOF_STAFF) {
      const data = await page.evaluate(id => {
        const character = getCharacterById(id); return { name: character.name, bio: character.bio, biography: character.biography, portrait: character.portrait };
      }, actor.id);
      assert.equal(data.name, actor.name); assert.equal(data.portrait, actor.portrait);
      assert.ok(JSON.stringify(data.biography).includes(actor.bio));
    }
    }

    if (!mapPage) { mapPage = await page.context().newPage(); mapPage.on('pageerror', error => mapErrors.push(error.message)); }
    await mapPage.setViewportSize(viewport);
    await mapPage.goto(`${preview.origin}/Karten/karte.html?map=${HOF_MAP_ID}`);
    await mapPage.waitForFunction(() => window.KartoRuntime?.state().pins.length === 16 && window.KartoRuntime.mapImageSize().width > 0);
    await mapPage.locator('#ln').evaluate(image => image.decode());
    assert.equal(await mapPage.locator('#pl .pin-marker-img').count(), 16);
    await mapPage.locator('#pl .pin-marker-img').evaluateAll(async images => {
      for (const image of images) { image.loading = 'eager'; await image.decode(); }
    });
    for (const poi of HOF_MAPPED_POIS) {
      assert.equal(await mapPage.locator(`#pl [data-id="tirfelyn-${poi.key}"] img`).getAttribute('src'), hofMapMarker(poi).url);
      const markerSize = await mapPage.evaluate(() => Math.round(KartoRuntime.pinDisplayOptions().dotSize * 2.2 * 1.5));
      assert.equal(Number(await mapPage.locator(`#pl [data-id="tirfelyn-${poi.key}"] img`).getAttribute('width')), markerSize);
    }
    assert.equal(await mapPage.locator('#lb-regions').isVisible(), false);
    assert.equal(await mapPage.evaluate(() => window.KARTO_CONFIG.images.normal === window.KARTO_CONFIG.images.pins), true);
    await capture(`${layout}-karte`, mapPage);
    const togglePeople = mapPage.locator('#lb-people');
    assert.equal(await togglePeople.textContent(), 'Personen');
    if (await togglePeople.getAttribute('aria-pressed') === 'true') await togglePeople.click();
    await togglePeople.click();
    await mapPage.locator('.people-layer').waitFor({ state: 'visible' });
    const households = await mapPage.evaluate(() => window.KARTO_CONFIG.peopleLayer.groups);
    for (const home of households) {
      await mapPage.evaluate(id => window.KartoPinNavigation.focus(id), home.pinId);
      const trigger = mapPage.locator(`.people-pill[data-people-pin="${home.pinId}"]`);
      await trigger.waitFor({ state: 'visible' }); await trigger.click();
      const popup = mapPage.locator('#people-popup');
      await popup.waitFor({ state: 'visible' });
      assert.equal(await popup.locator('.place-roster-member-list a').count(), home.members.length);
      await popup.locator('img').evaluateAll(async images => { for (const image of images) await image.decode(); });
      await mapPage.waitForTimeout(220);
      await popup.waitFor({ state: 'visible' });
      assert.equal(await mapPage.locator('#pin-tooltip').evaluate(tooltip => tooltip.classList.contains('show')), false);
      assert.ok(await popup.evaluate(node => { const rect = node.getBoundingClientRect(); return rect.top >= 0 && rect.bottom <= innerHeight && rect.width > 0; }));
      for (const person of home.members) assert.ok((await popup.innerText()).includes(person.name));
      peopleChecks.push({ layout, home: home.pinId, residents: home.members.length });
      if (['tirfelyn-holzfaellerhaus-ost', 'tirfelyn-holzfaellerhaus-sued', 'tirfelyn-bedienstetenhuette-04'].includes(home.pinId)) await capture(`${layout}-personen-${home.pinId}`, mapPage);
      await mapPage.keyboard.press('Escape'); await popup.waitFor({ state: 'hidden' });
    }
    await capture(`${layout}-personen`, mapPage);
    await togglePeople.click(); await mapPage.locator('.people-layer').waitFor({ state: 'hidden' });
    await mapPage.locator('#lb-pins').click();
    assert.equal(await mapPage.locator('#lb-pins').evaluate(button => button.classList.contains('on')), false);
    await mapPage.locator('#lb-pins').click();
    assert.equal(await mapPage.locator('#lb-pins').evaluate(button => button.classList.contains('on')), true);
    for (const poi of HOF_MAPPED_POIS) {
      const id = `tirfelyn-${poi.key}`;
      await mapPage.evaluate(id => window.KartoPinNavigation.focus(id), id);
      await mapPage.locator(`#pl [data-id="${id}"] .pin-marker-img`).click();
      await mapPage.locator('#scroll-mo').waitFor({ state: 'visible' });
      await mapPage.waitForFunction(() => !document.getElementById('pin-tooltip').classList.contains('show'));
      assert.equal(await mapPage.locator('#pin-detail-title').innerText(), poi.title);
      await mapPage.locator('#scroll-content .sv-location-image').evaluate(image => image.decode());
      assert.equal(await mapPage.locator('#scroll-content .sv-table tr').count(), 7);
      assert.equal(await mapPage.evaluate(() => Number(getComputedStyle(document.getElementById('scroll-mo')).zIndex)
        > Number(getComputedStyle(document.getElementById('lsb-toggle')).zIndex)), true, 'Der Kartenknopf darf die Infotabelle nicht überlagern');
      const geometry = await mapPage.locator('#scroll-content .sv-body').evaluate(body => {
        const image = body.querySelector('.sv-img-wrap').getBoundingClientRect();
        const table = body.querySelector('.sv-table').getBoundingClientRect();
        return { image: { x: image.x, y: image.y, right: image.right, bottom: image.bottom },
          table: { x: table.x, y: table.y, bottom: table.bottom }, width: body.clientWidth, scrollWidth: body.scrollWidth };
      });
      assert(geometry.scrollWidth <= geometry.width + 1);
      if (layout === 'desktop') {
        assert(Math.abs(geometry.image.y - geometry.table.y) <= 1, 'Bild und Tabelle beginnen bündig');
        assert(Math.abs(geometry.image.bottom - geometry.table.bottom) <= 1, 'Bild und Tabelle enden bündig');
        assert(geometry.image.right <= geometry.table.x + 1, 'Bild links, Tabelle rechts');
      } else assert(geometry.table.y >= geometry.image.bottom - 1, 'Mobil bleibt die Tabelle unter dem Bild lesbar');
      mapCards++;
      if (['holzfaellerlager', 'holzfaellerhaus-sued', 'bedienstetenhuette-04', 'hufschmiede'].includes(poi.key)) await capture(`${layout}-pin-${poi.key}`, mapPage);
      await mapPage.locator('#scroll-actions [data-action="close-scroll"]').click();
    }
  }
  assert.equal(await page.evaluate(() => window.__tirfelynWrites), 0);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await preview.openPage(entry, 0);
  const moduleMapLink = page.locator(`#modal-overlay a[href*="map=${HOF_MAP_ID}"]`).first();
  const popupPromise = page.waitForEvent('popup', { timeout: 1500 }).catch(() => null);
  await moduleMapLink.click();
  const mapFromModule = await popupPromise || page;
  if (mapFromModule !== page) openedPages.push(mapFromModule);
  await mapFromModule.waitForFunction(() => window.KartoRuntime?.state().pins.length === 16 && window.KartoRuntime.mapImageSize().width > 0);
  await capture('navigation-modul-zur-hofkarte', mapFromModule);
  navigationChecks.push('Almanach-Modul → Hofkarte');
  assert.equal(await mapFromModule.evaluate(() => window.KartoRuntime.state().markerCatalog.filter(marker => marker.group === 'Kleine Hoforte').length), 9);
  await mapFromModule.evaluate(() => window.openMarkerCatalog());
  await mapFromModule.locator('#mcat-mo').waitFor({ state: 'visible' });
  assert.equal(await mapFromModule.locator('#mcat-mo .mcat-item').count(), 9);
  await mapFromModule.locator('#mcat-mo .mcat-item img').evaluateAll(async images => { for (const image of images) await image.decode(); });
  await capture('navigation-neue-pins-im-katalog', mapFromModule);
  await mapFromModule.locator('#mcat-mo [data-action="close-modal"]').first().click();
  navigationChecks.push('Neun neue Pins im tatsächlichen Hof-Katalog');

  mapPage ||= await page.context().newPage();
  await mapPage.setViewportSize({ width: 1440, height: 1000 });
  await mapPage.goto(`${preview.origin}/Karten/karte.html?map=cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis&pin=gwynthor-marking-107`);
  await mapPage.locator('#scroll-mo').waitFor({ state: 'visible' });
  await mapPage.locator('#scroll-content .sv-location-image').evaluate(image => image.decode());
  await mapPage.locator('#scroll-actions [data-action="close-scroll"]').click();
  await mapPage.locator('#toggle-household-crests').click();
  await mapPage.locator('.household-pill').first().waitFor({ state: 'visible' });
  await mapPage.locator('.household-pill').first().click();
  await mapPage.locator('#household-popup').waitFor({ state: 'visible' });
  assert.ok(await mapPage.locator('#household-popup .household-family-list a').count() > 0);
  await mapPage.locator('#household-popup img').evaluateAll(async images => { for (const image of images) await image.decode(); });
  await capture('navigation-wappen-regression', mapPage);
  await mapPage.keyboard.press('Escape');
  await mapPage.locator('#toggle-household-crests').click();
  await mapPage.evaluate(() => window.KartoRuntime.openPin('gwynthor-marking-107'));
  navigationChecks.push('Bestehende Wappenliste mit gemeinsamer Darstellung');
  await capture('navigation-bannkreis-hofkarte', mapPage);
  const imageLink = mapPage.locator('#scroll-content .sv-img-wrap a');
  assert.ok((await imageLink.getAttribute('href')).includes(HOF_MAP_ID));
  await imageLink.click();
  await mapPage.waitForFunction(() => window.KartoRuntime?.state().pins.length === 16 && window.KartoRuntime.mapImageSize().width > 0);
  navigationChecks.push('Bannkreis-Hauptbild → Hofkarte');
  await mapPage.evaluate(() => window.KartoPinNavigation.focus('tirfelyn-hufschmiede'));
  await mapPage.locator('#pl [data-id="tirfelyn-hufschmiede"] .pin-marker-img').click();
  const sceneLink = mapPage.locator('#scroll-content .sv-lore a[href*="thread="]');
  const scenePopup = mapPage.waitForEvent('popup', { timeout: 1500 }).catch(() => null);
  await sceneLink.click();
  const sceneTarget = await scenePopup || mapPage;
  if (sceneTarget !== mapPage) openedPages.push(sceneTarget);
  const smithTarget = hofSceneDestination('hufschmiede');
  await sceneTarget.waitForURL(url => url.pathname.endsWith('/AleriaAlmanach.html') && url.searchParams.get('entry') === smithTarget.entryId);
  await sceneTarget.waitForFunction(() => typeof openModal === 'function' && ['ready', 'slow'].includes(document.querySelector('[data-loading-screen]')?.dataset.state));
  const enter = sceneTarget.locator('[data-loading-action="enter"]');
  await (await enter.isEnabled() ? enter : sceneTarget.locator('[data-loading-action="continue"]')).click();
  await sceneTarget.waitForFunction(threadId => typeof getCurrentCommentThreadId === 'function'
    && getCurrentCommentThreadId() === threadId, smithTarget.threadId);
  await sceneTarget.locator('#modal-overlay img[src*="tirfelyn-hof/scenes/hufschmiede"]').first().waitFor({ state: 'visible' });
  await sceneTarget.locator('#modal-overlay img[src*="tirfelyn-hof/scenes/hufschmiede"]').evaluateAll(async images => { for (const image of images) await image.decode(); });
  await capture('navigation-hofpin-zur-schmiedeszene', sceneTarget);
  navigationChecks.push('Hofpin → richtige interaktive Schmiedeszene');
  await sceneTarget.evaluate(() => openEntryById('tirfelyn-hof::session:tirfelyn-hof-poi-hufschmiede'));
  assert.equal(await sceneTarget.evaluate(() => getCurrentCommentThreadId()), smithTarget.threadId);
  await capture('navigation-alter-szenenlink-zur-neuen-schmiede', sceneTarget);
  navigationChecks.push('Alter Szenenlink → ausgelagertes Schmiedemodul');
  await sceneTarget.goto(`${preview.origin}/AleriaAlmanach/AleriaAlmanach.html?entry=tirfelyn-hof&thread=${encodeURIComponent('tirfelyn-hof::session:tirfelyn-hof-poi-hufschmiede')}`);
  await sceneTarget.waitForFunction(() => typeof openModal === 'function' && ['ready', 'slow'].includes(document.querySelector('[data-loading-screen]')?.dataset.state));
  const legacyEnter = sceneTarget.locator('[data-loading-action="enter"]');
  await (await legacyEnter.isEnabled() ? legacyEnter : sceneTarget.locator('[data-loading-action="continue"]')).click();
  await sceneTarget.waitForFunction(thread => typeof getCurrentCommentThreadId === 'function' && getCurrentCommentThreadId() === thread, smithTarget.threadId);
  await sceneTarget.locator('#modal-overlay img[src*="tirfelyn-hof/scenes/hufschmiede"]').first().waitFor({ state: 'visible' });
  await sceneTarget.locator('#modal-overlay img[src*="tirfelyn-hof/scenes/hufschmiede"]').evaluateAll(async images => { for (const image of images) await image.decode(); });
  await capture('navigation-alte-url-zur-neuen-schmiede', sceneTarget);
  navigationChecks.push('Alte vollständige URL → ausgelagertes Schmiedemodul');
  assert.equal(actorChecks.length, navigationOnly || mapOnly ? 0 : 45);
  assert.deepEqual(preview.errors, []);
  assert.deepEqual(mapErrors, []);
  assert.equal(peopleChecks.length, navigationOnly ? 0 : 27);
  await writeFile(resolve(output, 'report.json'), JSON.stringify({ passed: true, mode: navigationOnly ? 'navigation' : mapOnly ? 'map' : 'full', checks, actorChecks, navigationChecks, peopleChecks, screenshots, mapCards,
    fixture: 'Echte Anwendung, aktueller lokaler Figurensnapshot und nativer Kreaturenkatalog; lokaler Kommentaradapter, keine produktiven Writes.' }, null, 2));
  console.log(JSON.stringify({ passed: true, moduleViews: checks.length, actorSelections: actorChecks.length, mapCards, navigationChecks, peopleChecks: peopleChecks.length, screenshots: screenshots.length, output }));
} catch (error) {
  await capture('failure').catch(() => {});
  if (mapPage && !mapPage.isClosed()) await capture('failure-map', mapPage).catch(() => {});
  await writeFile(resolve(output, 'report.json'), JSON.stringify({ passed: false, error: error.message, checks, actorChecks, screenshots, mapCards, navigationChecks, peopleChecks, mapErrors, errors: preview.errors }, null, 2));
  throw error;
} finally { for (const opened of openedPages) await opened.close().catch(() => {}); await mapPage?.close().catch(() => {}); await preview.close(); }
