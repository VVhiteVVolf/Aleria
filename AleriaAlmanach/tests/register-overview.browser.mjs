import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(root, 'diagnostics/register-overview-20261113', `browser-${Date.now()}`);
await mkdir(output, { recursive: true });
const server = await startChartQualityServer(root);
let browser;
const report = { fixture: '5000 synthetic directory records; in-memory character writes only', screenshots: [], layouts: [], errors: [], externalRequestsBlocked: 0 };
try {
  browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 1000 } });
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.origin !== server.origin || request.method() !== 'GET' || /\/firebase\.js$/.test(url.pathname)) {
      report.externalRequestsBlocked++; return route.abort();
    }
    if (url.pathname === '/CharakterDatenbank/registry.json') return route.fulfill({ json: { schema: 'aleria.character-registry', records: [] } });
    if (url.pathname.startsWith('/AleriaAlmanach/assets/')) {
      const path = resolve(root, 'AleriaAlmanach/public', '.' + decodeURIComponent(url.pathname.slice('/AleriaAlmanach'.length)));
      try { return route.fulfill({ body: await readFile(path), contentType: /\.webp$/.test(path) ? 'image/webp' : /\.png$/.test(path) ? 'image/png' : 'application/octet-stream' }); }
      catch { /* The checked-in assets directory is served by the shared server. */ }
    }
    return route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  await page.goto(`${server.origin}/AleriaAlmanach/AleriaAlmanach.html`, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof openCharProfile === 'function' && typeof AleriaCharacterDirectory !== 'undefined' && window.AleriaCharacterGenealogy);
  await page.evaluate(() => {
    const full = new Map();
    const records = Array.from({ length: 5000 }, (_, i) => ({ id: `fixture-${String(i).padStart(5, '0')}`,
      name: i === 4999 ? 'Éowen Prüfperson 4999' : `Prüffigur ${String(i).padStart(4, '0')}`,
      title: i % 3 ? 'Hafenwache' : 'Handwerkerin', role: i % 3 ? 'Wache' : 'Handwerk',
      portrait: '../IconOrdner/ReiterIcons/Charakterregister/people-v1.webp', aliases: [`Alias ${i}`],
      genealogy: i % 4 === 0 ? { houseName: `Familie ${i % 53}`, sources: [] } : {},
      fraktion: i % 4 === 1 ? `Gefolge ${i % 17}` : '', currentLocation: i % 2 ? 'Gwynthor' : 'Llysfaen',
      status: i % 7 ? 'active' : 'missing', relevance: i % 11 ? 'minor' : 'important',
      createdAt: '2026-11-12T10:00:00Z', updatedAt: '2026-11-13T10:00:00Z', _directorySummary: true }));
    for (const summary of records) {
      const record = { ...summary, bio: 'Erhaltene vollständige Beschreibung.',
        inventory: { revision: 11, categories: [] }, combatProfile: { revision: 12, hitPoints: { current: 13 } } };
      delete record._directorySummary; full.set(record.id, record);
    }
    const tabs = { tabs: ['Alle', ...Array.from({ length: 30 }, (_, i) => `Gruppe ${i + 1}`)], map: {}, subtabs: {}, subtabMap: {} };
    records.filter((_, i) => i % 4 === 2).forEach((record, i) => (tabs.map[`Gruppe ${i % 30 + 1}`] ||= []).push(record.id));
    globalThis.registerFixture = { records, full, calls: { directory: [], full: [], writes: [] } };
    _characters = []; _charactersLoaded = false; _charTabsLoaded = false;
    _fbReady = true; window._fbReady = true;
    window._fb = {
      loadCharTabs: async () => structuredClone(tabs),
      loadModuleStore: async () => null,
      loadCharacterDirectoryPage: async ({ pageToken }) => {
        const start = Number(pageToken || 0); registerFixture.calls.directory.push(start);
        return { records: records.slice(start, start + 200), nextPageToken: start + 200 < records.length ? String(start + 200) : '' };
      },
      loadCharacters: async options => {
        registerFixture.calls.full.push(options?.ids || 'ALL');
        if (!options?.ids) return [...full.values()].map(record => structuredClone(record));
        return options.ids.flatMap(id => full.has(id) ? [structuredClone(full.get(id))] : []);
      },
      listPublishedFamilyRegistry: async () => [], loadPublishedFamily: async () => null,
      saveCharacter: async (id, data, options) => {
        assertFixtureWrite(id, data, options);
        full.set(id, { ...(full.get(id) || {}), ...structuredClone(data), id });
        registerFixture.calls.writes.push({ id, fields: Object.keys(data) }); return id;
      }
    };
    globalThis.assertFixtureWrite = (id, _data, options) => { if (!id || !options?.createWithId) throw Error('Only a new in-memory genealogy fixture may be written'); };
    window.dispatchEvent(new Event('fb-ready'));
    document.querySelector('[data-loading-screen]')?.remove();
    delete document.documentElement.dataset.almanachLoading;
    const content = document.querySelector('[data-almanach-content]');
    if (content) { content.inert = false; content.removeAttribute('aria-hidden'); }
    _activeTab = 'Charaktere'; renderAll();
  });
  await page.waitForFunction(() => AleriaCharacterDirectory.isComplete());
  assert.equal(await page.evaluate(() => registerFixture.calls.full.length), 0, 'opening the register must not read any full character');
  assert.equal(await page.locator('.char-category-tile').count(), 24, 'initial directory markup is bounded');
  assert.equal(await page.locator('.char-card-compact').count(), 0);
  assert.equal(await page.evaluate(() => typeof window.AleriaCharacterGenealogy.getFamilyMemberships), 'undefined', 'the overview must not load all family trees');
  report.registerIcons = await page.locator('#char-grid .char-register-icon').evaluateAll(async images => {
    await Promise.all(images.map(image => { image.loading = 'eager'; return image.decode().catch(() => {}); }));
    return { sources: [...new Set(images.map(image => image.src))], broken: images.filter(image => !image.naturalWidth).map(image => image.src) };
  });
  assert.deepEqual(report.registerIcons.broken, []);
  assert.equal(report.registerIcons.sources.length, 15, 'all 15 new icons must load through their actual application URLs');

  async function capture(name) {
    await page.locator('.char-register-icon, .char-compact-portrait img, .genealogy-person-portrait img, .archive-hierarchy-row-icon img, .archive-hierarchy-entry-icon img, .card-image-wrap img').evaluateAll(async images => {
      await Promise.all(images.filter(image => { const r = image.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }).map(image => {
        image.loading = 'eager'; return image.decode().catch(() => {});
      }));
    });
    const path = resolve(output, `${name}.png`); await page.screenshot({ path }); report.screenshots.push(path);
  }
  async function checkLayout(name) {
    const layout = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth,
      grid: document.querySelector('#char-grid')?.getBoundingClientRect().toJSON(),
      overflow: [...document.querySelectorAll('.char-register-view-toolbar, .char-category-tiles, .char-result-pages, .genealogy-import-card')]
        .filter(element => element.getClientRects().length && element.scrollWidth > element.clientWidth + 2).map(element => element.className) }));
    assert.ok(layout.scroll <= layout.width + 2, `${name}: page overflows`); assert.deepEqual(layout.overflow, [], `${name}: controls overflow`);
    report.layouts.push({ name, ...layout });
  }
  await page.locator('#char-grid').evaluate(element => { element.scrollIntoView({ block: 'start' }); window.scrollBy(0, -80); });
  await capture('desktop-characters'); await checkLayout('desktop-characters');
  await page.locator('.char-category-heading').evaluate(element => { element.scrollIntoView({ block: 'start' }); window.scrollBy(0, -80); });
  await capture('desktop-categories');
  assert.deepEqual(await page.locator('#char-grid .char-register-icon').evaluateAll(images => images.filter(image => image.complete && !image.naturalWidth).map(image => image.src)), []);
  await page.locator('[data-character-category-action="more"]').click();
  assert.equal(await page.locator('.char-category-tile').count(), 48);
  await page.locator('[data-character-category-action="kind"][data-category-kind="family"]').click();
  assert.equal(await page.locator('.char-category-tile').count(), 24);
  await capture('desktop-families');
  await page.locator('[data-character-register-action="search"]').fill('eowen gwynthor');
  await page.waitForFunction(() => document.querySelectorAll('.char-card-compact').length === 1);
  assert.match(await page.locator('.char-card-compact').innerText(), /Éowen/);
  assert.equal(await page.locator('[data-character-register-action="search"]').evaluate(element => document.activeElement === element), true);
  await capture('desktop-search');
  await page.locator('.char-card-compact').press('Enter');
  await page.locator('#char-profile-overlay.active').waitFor();
  assert.equal(await page.locator('#cp-name').inputValue(), 'Éowen Prüfperson 4999');
  assert.deepEqual(await page.evaluate(() => registerFixture.calls.full), [['fixture-04999']]);
  assert.equal(await page.evaluate(() => getCharacterById('fixture-04999').inventory.revision), 11);
  await page.evaluate(() => closeCharProfile({ skipUnsavedCheck: true }));
  await page.locator('[data-character-register-action="clear-search"]').click();
  await page.locator('[data-character-category-action="all"]').click();
  assert.equal(await page.locator('.char-card-compact').count(), 36);
  const first = await page.locator('.char-card-compact').first().getAttribute('data-char-id');
  await page.locator('[data-character-page="1"]').click();
  assert.notEqual(await page.locator('.char-card-compact').first().getAttribute('data-char-id'), first);
  assert.equal(await page.locator('.char-card-compact').count(), 36);
  await page.locator('[data-character-category-action="reset"]').click();

  await page.locator('.char-archive-actions [data-character-genealogy-action="open-import"]').click();
  await page.locator('#genealogy-import-overlay.active .genealogy-import-start').waitFor();
  assert.equal(await page.locator('.genealogy-person-row').count(), 0);
  assert.equal(await page.evaluate(() => registerFixture.calls.full.length), 1);
  await capture('desktop-import-start');
  await page.locator('[data-character-genealogy-role="family-search"]').fill('Draig');
  await page.locator('[data-character-genealogy-role="family-select"]').selectOption('haus-draig');
  await page.waitForFunction(() => document.querySelectorAll('.genealogy-person-row').length > 0);
  assert.ok(await page.locator('.genealogy-person-row').count() <= 40);
  await capture('desktop-import-family');
  await page.locator('[data-character-genealogy-role="search"]').fill('Myriad');
  await page.waitForFunction(() => document.querySelector('.genealogy-preview-heading h3')?.textContent.includes('Myriad'));
  await capture('desktop-import-person');
  await page.locator('[data-character-genealogy-action="create-character"]').click();
  await page.locator('#genealogy-import-overlay').waitFor({ state: 'hidden' });
  await page.locator('#char-profile-overlay.active').waitFor();
  assert.match(await page.locator('#cp-name').inputValue(), /Myriad/);
  report.imported = await page.evaluate(() => ({ writes: registerFixture.calls.writes, id: _editingChar }));
  assert.equal(report.imported.writes.length, 1);
  await page.evaluate(() => closeCharProfile({ skipUnsavedCheck: true }));
  await page.locator('.char-archive-actions [data-character-genealogy-action="open-import"]').click();
  await page.locator('#genealogy-import-overlay.active .genealogy-import-start').waitFor();
  await page.locator('[data-character-genealogy-role="family-select"]').selectOption('haus-draig');
  await page.locator('[data-character-genealogy-role="match-filter"]').selectOption('linked');
  await page.locator('[data-character-genealogy-role="search"]').fill('Myriad');
  await page.waitForFunction(() => document.querySelectorAll('.genealogy-person-row').length === 1);
  assert.equal(await page.locator('[data-character-genealogy-action="create-character"]').count(), 0);
  await capture('desktop-import-linked');
  await page.keyboard.press('Escape');
  await page.locator('#genealogy-import-overlay').waitFor({ state: 'hidden' });

  for (const [width, height] of [[1024, 900], [390, 844], [320, 780]]) {
    await page.setViewportSize({ width, height });
    await page.locator('[data-character-register-action="search"]').fill('');
    await page.evaluate(() => { resetCharacterRegisterFilters(); renderCharGrid(); });
    await page.locator('#char-grid').scrollIntoViewIfNeeded();
    await checkLayout(`${width}-characters`); await capture(`${width}-characters`);
    await page.locator('[data-character-register-action="search"]').fill('Prüffigur gwynthor');
    await page.waitForFunction(() => document.querySelectorAll('.char-card-compact').length === 36);
    await checkLayout(`${width}-results`); await capture(`${width}-results`);
    await page.locator('.char-archive-actions [data-character-genealogy-action="open-import"]').click();
    await page.locator('#genealogy-import-overlay.active .genealogy-import-start').waitFor();
    await checkLayout(`${width}-import`); await capture(`${width}-import`);
    await page.locator('[data-character-genealogy-role="family-select"]').selectOption('haus-draig');
    await page.waitForFunction(() => document.querySelectorAll('.genealogy-person-row').length > 0);
    await checkLayout(`${width}-import-family`); await capture(`${width}-import-family`);
    if (width < 820) {
      await page.locator('.genealogy-person-select').first().click();
      await page.locator('.genealogy-preview-back').waitFor({ state: 'visible' });
      await checkLayout(`${width}-import-preview`); await capture(`${width}-import-preview`);
      await page.locator('.genealogy-preview-back').click();
      await page.locator('.genealogy-person-select').first().waitFor({ state: 'visible' });
    }
    await page.keyboard.press('Escape');
    await page.locator('#genealogy-import-overlay').waitFor({ state: 'hidden' });
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => {
    const region = ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Bannkreis Gwynthor', 'Gwynthor-Stadt'];
    const names = ['Osttor', 'Westtor', 'Hafen', 'Stadtzentrum', 'Marktplatz', 'Landgut', 'Gestüt', 'Gasthof'];
    const images = ['osttor-torbruecke-v2', 'westtor-torbruecke-v2', 'hafen-zentral-v1', 'zentrum-plaza-v1', 'zentrum-park-v2'];
    applyModuleStorePayload({ customSections: names.map((name, i) => ({ key: name, tab: 'Völker & Kulturen', path: [...region, name], entries: [{
      id: `fixture-module-${i}`, title: name === 'Landgut' ? 'Der Hof am grünen Hang' : name,
      subtitle: 'Orte und Geschichten aus Gwynthor', image: `./assets/gwynthor-stadtorte/${images[i % images.length]}.webp`,
      pages: [{ title: name, description: 'Lokale Ansicht zur Prüfung der Modulnavigation.' }]
    }] })) });
    _activeTab = 'Völker & Kulturen'; setActiveArchivePath(_activeTab, region); expandArchiveHierarchyPath(_activeTab, region); renderAll();
  });
  await page.locator('.archive-browser-content .entry-card').first().waitFor();
  await page.locator('.archive-browser-content').evaluate(element => { element.scrollIntoView({ block: 'start' }); window.scrollBy(0, -80); });
  const compact = await page.locator('.archive-browser-content .entry-card').first().boundingBox();
  if (compact.height >= 300) {
    await capture('desktop-module-height-diagnostic');
    report.moduleHeightDiagnostic = await page.locator('.archive-browser-content .entry-card').first().evaluate(card =>
      [card, ...card.querySelectorAll('*')].map(element => ({ tag: element.tagName, class: element.className,
        width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height,
        font: getComputedStyle(element).font, padding: getComputedStyle(element).padding, minHeight: getComputedStyle(element).minHeight })));
  }
  assert.ok(compact.height < 300, `module preview is still too large: ${compact.height}`);
  assert.ok(await page.locator('.archive-hierarchy-row-mark').count() === 0);
  await checkLayout('desktop-modules'); await capture('desktop-modules');
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await checkLayout(`${width}-modules`); await capture(`${width}-modules`);
    await page.locator('.archive-hierarchy-tree > summary').click();
    await capture(`${width}-contents`);
    await page.locator('.archive-hierarchy-tree > summary').click();
  }
  report.calls = await page.evaluate(() => registerFixture.calls);
  assert.equal(report.calls.full.includes('ALL'), false);
  assert.equal(report.calls.writes.length, 1, 'only one explicitly tested in-memory genealogy creation');
  assert.deepEqual(report.errors, []);
  report.passed = true;
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ passed: true, output, screenshots: report.screenshots.length, directoryPages: report.calls.directory.length, fullReads: report.calls.full.length }));
} catch (error) {
  report.failure = error.stack;
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2));
  console.error(JSON.stringify({ output, failure: error.message })); throw error;
} finally { await browser?.close(); await server.close(); }
