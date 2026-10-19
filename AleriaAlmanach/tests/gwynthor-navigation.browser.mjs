import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
const argument = process.argv.find(arg => arg.startsWith('--store='));
const sources = argument ? JSON.parse(await readFile(argument.slice(8), 'utf8')) : JSON.parse(await readFile(new URL('../modules/economy-calculator/sources/public-shop-modules-2026-10-19.json', import.meta.url), 'utf8'));
const payload = argument ? sources : { customSections: sources.records.map(({ section, entry }) => ({ ...section, entries: [entry] })) };
const region = ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft'];
const rural = [...region, 'Bannkreis Gwynthor'], city = [...rural, 'Gwynthor-Stadt'];
const owain = [...rural, 'Owains Anwesen & Gestüt'], redGate = [...rural, 'Zum Roten Tor'];
const preview = await openVenueBrowserPreview('gwynthor-navigation'), { page } = preview;
try {
  await page.setViewportSize({ width: 1460, height: 1050 });
  const setup = await page.evaluate(({ payload, city }) => {
    applyModuleStorePayload(payload);
    const sections = getValidSections(), ids = sections.flatMap(section => section.entries.map(entry => entry.id));
    const known = ['modul-1781813764249', 'gwynthor-zum-letzten-heller', 'goettliche-eleganz', 'gwynthor-zur-klingenden-krone'];
    const entries = known.map(id => {
      const section = sections.find(section => section.entries.some(entry => entry.id === id));
      const entry = section.entries.find(entry => entry.id === id);
      return { id, path: getSectionPathParts(section), threads: entry.pages.map(page => page.commentThreadKey || '') };
    });
    const start = performance.now(); switchTab('Völker & Kulturen', { resetPath: true, render: true }); const switchMs = performance.now() - start;
    setActiveArchivePath('Völker & Kulturen', city); expandArchiveHierarchyPath('Völker & Kulturen', city); renderAll();
    globalThis.navigationProbe = { metrics: {}, dashboard: document.querySelector('[data-archive-dashboard]'), toolbar: document.querySelector('.archive-toolbar'), content: document.querySelector('.archive-browser-content') };
    for (const name of ['getAllSections', 'getValidSections', 'renderArchiveDashboard', 'loadCharacters']) {
      const original = globalThis[name];
      globalThis[name] = function (...args) { const start = performance.now(); try { return original.apply(this, args); } finally {
        const item = navigationProbe.metrics[name] ||= { calls: 0, ms: 0 }; item.calls++; item.ms += performance.now() - start;
      } };
    }
    return { entries, count: ids.length, uniqueCount: new Set(ids).size, switchMs };
  }, { payload, city });
  assert.equal(setup.count, setup.uniqueCount, 'each module remains in one category');
  assert.deepEqual(setup.entries.find(entry => entry.id === 'modul-1781813764249').path, owain);
  assert.deepEqual(setup.entries.find(entry => entry.id === 'gwynthor-zum-letzten-heller').path, city);
  assert.deepEqual(setup.entries.find(entry => entry.id === 'goettliche-eleganz').path, [...city, 'Der Markt der Fortuna - Gwynthor']);
  assert.deepEqual(setup.entries.find(entry => entry.id === 'gwynthor-zur-klingenden-krone').path, [...city, 'Die Klingende Münze - Gwynthor']);
  const toggle = await page.evaluate(city => {
    navigationProbe.metrics = {};
    const samples = [], firstCard = document.querySelector('.archive-browser-content .entry-card');
    for (let i = 0; i < 6; i++) {
      const button = [...document.querySelectorAll('[data-archive-action="toggle-hierarchy-node"]')].find(button => button.dataset.sectionPath === encodeArchivePathData(city));
      const start = performance.now(); button.click(); samples.push(performance.now() - start);
    }
    return { samples, metrics: structuredClone(navigationProbe.metrics), cardPreserved: firstCard === document.querySelector('.archive-browser-content .entry-card'), dashboardPreserved: navigationProbe.dashboard === document.querySelector('[data-archive-dashboard]') };
  }, city);
  assert.ok(toggle.cardPreserved); assert.ok(toggle.dashboardPreserved);
  assert.equal(toggle.metrics.getAllSections?.calls || 0, 0, 'tree expansion does not reconstruct the store');
  assert.equal(toggle.metrics.renderArchiveDashboard?.calls || 0, 0);
  const selections = [];
  for (const path of [rural, owain, redGate, ['Cenyr'], city]) {
    selections.push(await page.evaluate(path => {
      navigationProbe.metrics = {};
      const button = [...document.querySelectorAll('[data-archive-action="select-hierarchy-node"]')].find(button => button.dataset.sectionPath === encodeArchivePathData(path));
      if (!button) throw Error('Missing category: ' + path.join(' > '));
      const start = performance.now(); button.click();
      return { path, ms: performance.now() - start, title: document.querySelector('.archive-hierarchy-content-heading h2').textContent,
        metrics: structuredClone(navigationProbe.metrics), cards: [...document.querySelectorAll('.archive-browser-content .entry-card-open')].map(card => card.dataset.entryId),
        toolbarPreserved: navigationProbe.toolbar === document.querySelector('.archive-toolbar'), dashboardPreserved: navigationProbe.dashboard === document.querySelector('[data-archive-dashboard]') };
    }, path));
  }
  for (const selection of selections) { assert.ok(selection.toolbarPreserved); assert.ok(selection.dashboardPreserved); assert.equal(selection.title, selection.path.at(-1)); }
  assert.ok(selections.find(item => item.path.at(-1) === 'Owains Anwesen & Gestüt').cards.includes('modul-1781813764249'));
  assert.equal(selections.find(item => item.path.at(-1) === 'Zum Roten Tor').cards.length, 0, 'future tavern has no fabricated content yet');
  const navigationMetrics = selections.map(selection => selection.metrics);
  for (const metrics of navigationMetrics) assert.equal(metrics.getAllSections?.calls || 0, 0, 'folder selection reuses its mounted data snapshot');
  await preview.decodeImages('.archive-hierarchy-row-icon img');
  const layouts = [];
  for (const [name, width] of [['desktop', 1460], ['compact-desktop', 1101], ['tablet', 1024], ['phone', 390]]) {
    await page.setViewportSize({ width, height: 1050 });
    const details = page.locator('.archive-hierarchy-tree');
    await details.evaluate(element => { element.open = true; });
    const bounds = await page.locator('.archive-browser-layout').evaluate(element => ({ width: element.clientWidth, scrollWidth: element.scrollWidth, tree: element.querySelector('.archive-hierarchy-tree').clientWidth }));
    assert.ok(bounds.scrollWidth <= bounds.width + 2, `no horizontal page overflow at ${width}`);
    if (width > 1100) assert.ok(bounds.tree >= 270, 'desktop directory has room for readable place names');
    await preview.capture(name);
    layouts.push({ name, viewport: width, ...bounds });
  }
  await page.setViewportSize({ width: 1460, height: 1050 });
  await page.evaluate(() => setArchiveSearch('Owains', { immediate: true }));
  assert.ok(await page.locator('.entry-card-open[data-entry-id="modul-1781813764249"]').count());
  await page.evaluate(() => setArchiveSearch('', { immediate: true }));
  const beforeEdit = await page.evaluate(() => getValidSections().flatMap(section => section.entries).find(entry => entry.id === 'gwynthor-zum-letzten-heller'));
  await preview.openPage(beforeEdit, 0);
  assert.match(await page.locator('.modal-title').innerText(), /Letzten Heller/);
  await page.evaluate(() => closeModal());
  const fresh = await page.evaluate(({ payload, city }) => {
    const changed = structuredClone(payload);
    changed.customSections ||= [];
    changed.customSections.push({ key: 'Gwynthor-Stadt', tab: 'Völker & Kulturen', path: city, entries: [{ id: 'navigation-freshness-test', title: 'Neuer Navigationstest', multipage: true, pages: [{ pageTitle: 'Erhalten' }] }] });
    applyModuleStorePayload(changed);
    const button = [...document.querySelectorAll('[data-archive-action="select-hierarchy-node"]')].find(button => button.dataset.sectionPath === encodeArchivePathData(city));
    button.click();
    return !!document.querySelector('.entry-card-open[data-entry-id="navigation-freshness-test"]');
  }, { payload, city });
  assert.ok(fresh, 'a changed store invalidates the mounted snapshot and fresh content appears');
  assert.deepEqual(preview.errors, []);
  const report = { passed: true, setup, toggle, selections, navigationMetrics, layouts, fresh, externalWrites: false };
  await writeFile(resolve(preview.output, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ passed: true, output: preview.output, switchMs: setup.switchMs, toggleMs: toggle.samples, selectionMs: selections.map(item => item.ms) }));
} finally { await preview.close(); }
