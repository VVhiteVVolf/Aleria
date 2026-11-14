import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { buildCastleRegistrations } from '../modules/gwynthor-castles/castle-modules.mjs';
import { CASTLE_HOUSES } from '../modules/gwynthor-castles/castle-houses.mjs';
import { GWYNTHOR_CITY_PATH } from '../modules/gwynthor-geography/gwynthor-section-layout.mjs';

const structureOnly = process.argv.includes('--structure-only');
const output = path.resolve(`diagnostics/gwynthor-castles-20261114/browser-${Date.now()}`);
await fs.mkdir(output, { recursive: true });
const registrations = buildCastleRegistrations(), ids = registrations.map(row => row.entry.id);
const preview = await openVenueBrowserPreview('gwynthor-castles'), { page } = preview;
const shots = [], checks = [], network = [], navigation = [];
const capture = async (name, target = page) => {
  const file = path.join(output, `${name}.png`); await target.screenshot({ path: file }); shots.push(file);
};
try {
  await page.context().route('**/*', route => {
    const request = route.request(), url = new URL(request.url());
    if (url.origin === preview.origin && request.method() === 'GET') return route.continue();
    if (request.method() === 'GET' && (request.resourceType() === 'image' || url.origin === 'https://www.gstatic.com' && url.pathname.startsWith('/firebasejs/'))) return route.fallback();
    network.push({ method: request.method(), origin: url.origin, blocked: true }); return route.abort();
  });
  await page.evaluate(() => {
    window.__castleWrites = 0;
    const noWrite = async () => { window.__castleWrites++; throw Error('Castle fixture blocks writes.'); };
    window._fb = { ...getLocalCommentBackend(), _localFallback: false, loadCharacters: async () => [], loadCreatures: async () => [],
      addComment: noWrite, saveCharacter: noWrite, saveModuleStore: noWrite };
    _fbReady = true;
  });
  const placements = await page.evaluate(ids => getValidSections().flatMap(section => section.entries.filter(entry => ids.includes(entry.id))
    .map(entry => ({ id: entry.id, path: getSectionPathParts(section) }))), ids);
  assert.equal(placements.length, 10);
  for (const registration of registrations) assert.deepEqual(placements.find(row => row.id === registration.entry.id).path, registration.path);
  const endpoints = await page.evaluate(ids => getSceneTransitionEndpoints().filter(endpoint => ids.includes(endpoint.entryId)).map(endpoint => endpoint.threadId), ids);
  assert.equal(endpoints.length, 29); assert.equal(new Set(endpoints).size, 29);

  for (const [layout, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }], ['small-mobile', { width: 320, height: 740 }]]) {
    await page.setViewportSize(viewport);
    await page.evaluate(city => { closeModal(); switchTab('Völker & Kulturen', { resetPath: true, render: true });
      setActiveArchivePath('Völker & Kulturen', city); expandArchiveHierarchyPath('Völker & Kulturen', city); renderAll(); }, GWYNTHOR_CITY_PATH);
    for (const house of CASTLE_HOUSES) {
      const result = await page.evaluate(({ path, ids }) => {
        const button = [...document.querySelectorAll('[data-archive-action="select-hierarchy-node"]')]
          .find(button => button.dataset.sectionPath === encodeArchivePathData(path));
        if (!button) throw Error(`Burgkategorie fehlt: ${path.at(-1)}`);
        button.click();
        return { title: document.querySelector('.archive-hierarchy-content-heading h2').textContent,
          cards: [...document.querySelectorAll('.archive-browser-content .entry-card-open')].map(card => card.dataset.entryId).filter(id => ids.includes(id)) };
      }, { path: house.path, ids });
      assert.equal(result.title, house.title);
      assert.equal(result.cards.length, house.id === 'saethwyr' ? 4 : 3);
      navigation.push({ layout, house: house.id, ...result });
    }
    for (const { entry } of registrations) {
      const roundtrip = await page.evaluate(entry => { const once = sanitizeModuleEntry(structuredClone(entry)); return { once, twice: sanitizeModuleEntry(structuredClone(once)) }; }, entry);
      assert.deepEqual(roundtrip.once, roundtrip.twice);
      assert.deepEqual(roundtrip.once.pages.map(p => p.commentThreadKey), entry.pages.map(p => p.commentThreadKey));
      for (const [index, model] of entry.pages.entries()) {
        await preview.openPage(entry, index);
        if (!structureOnly) await preview.decodeImages('#modal-overlay img[src*="gwynthor-castles/"]');
        assert.equal(await page.locator('#modal-overlay .session-stage-title').textContent(), model.pageTitle);
        assert.equal(await page.evaluate(() => getCurrentCommentThreadId()), `${entry.id}::session:${model.commentThreadKey}`);
        assert.equal(await page.locator('#modal-overlay [data-action="open-comment-form"]').count(), 1);
        const bounds = await page.locator('#modal-overlay .modal-card').evaluate(element => ({ width: element.clientWidth, scrollWidth: element.scrollWidth }));
        assert(bounds.scrollWidth <= bounds.width + 2, `${layout}: ${entry.id}/${index}`);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
        if (index === 0) {
          const toggle = page.locator('#modal-overlay .session-intro-toggle');
          const initiallyVisible = await page.locator('#modal-overlay .session-stage-copy').isVisible();
          await toggle.focus(); await toggle.press('Enter');
          assert.equal(await page.locator('#modal-overlay .session-stage-copy').isVisible(), !initiallyVisible);
          await toggle.press('Enter');
          assert.equal(await page.locator('#modal-overlay .session-stage-copy').isVisible(), initiallyVisible);
          if (!initiallyVisible) await toggle.press('Enter');
        }
        if (!structureOnly && (layout !== 'small-mobile' || /thronsaal|esssaal|burghafen|zugbruecke/.test(model.commentThreadKey))) {
          await page.locator('.modal-page-tab.active').first().scrollIntoViewIfNeeded();
          await capture(`${layout}-${entry.id}-${model.commentThreadKey}`);
        }
        checks.push({ layout, entry: entry.id, page: index + 1, thread: model.commentThreadKey, ...bounds });
      }
      if (entry.pages.length > 1) {
        await page.locator('[data-modal-action="jump-page"][data-page-index="0"]').first().click();
        await page.waitForFunction(title => document.querySelector('#modal-overlay .session-stage-title')?.textContent === title, entry.pages[0].pageTitle);
        assert.equal(await page.locator('#modal-overlay .session-stage-title').textContent(), entry.pages[0].pageTitle);
      }
    }
  }
  // Exercise the actual comment-form opener without a live character or save.
  await preview.openPage(registrations[0].entry, 0);
  const openForm = page.locator('#modal-overlay [data-action="open-comment-form"]');
  await openForm.focus(); await openForm.press('Enter');
  await page.locator('#comment-form-overlay').waitFor({ state: 'visible' });
  await page.locator('#comment-form-overlay [data-action="close-comment-form"]').click();
  await page.locator('#comment-form-overlay').waitFor({ state: 'hidden' });
  await page.evaluate(() => closeModal());
  assert.equal(await page.evaluate(() => window.__castleWrites), 0);

  if (!structureOnly) {
    const manifest = JSON.parse(await fs.readFile(new URL('../assets/gwynthor-castles/manifest.json', import.meta.url), 'utf8'));
    const gallery = await page.context().newPage(); await gallery.setViewportSize({ width: 1100, height: 1660 });
    for (let offset = 0; offset < manifest.active.length; offset += 4) {
      const items = manifest.active.slice(offset, offset + 4);
      await gallery.setContent(`<html lang="de"><style>body{margin:0;padding:15px;background:#292722;color:#fff;font:18px sans-serif;display:grid;grid-template-columns:1fr 1fr;gap:15px}figure{margin:0;height:795px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#d7d1c4}img{max-width:100%;max-height:750px;object-fit:contain}figcaption{height:35px;color:#111;padding:5px}</style>${items.map(item => `<figure><img src="${preview.origin}/${item.path}"><figcaption>${item.key}</figcaption></figure>`).join('')}</html>`);
      await gallery.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
      await capture(`art-review-${offset / 4 + 1}`, gallery);
    }
    await gallery.close();
  }
  assert.deepEqual(preview.errors, []);
  const report = { passed: true, structureOnly, modules: 10, scenes: 29, views: checks.length, placements, endpoints,
    navigation, checks, shots, blockedNetwork: network, productionWrites: 0, fixture: 'existing venue preview, local comment backend and empty fixture cast',
    visualInspection: 'Screenshots saved for separate human/model image inspection; this harness does not claim that inspection.',
    browserClosedInFinally: true };
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ passed: true, output, views: checks.length, screenshots: shots.length, structureOnly }));
} catch (error) {
  await capture('failure').catch(() => {});
  await fs.writeFile(path.join(output, 'failure.json'), JSON.stringify({ error: error.stack, shots, checks, navigation, network }, null, 2) + '\n');
  throw error;
} finally { await preview.close(); }
