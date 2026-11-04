import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { DRAIG_HOUSEHOLDS, DRAIG_WINGS } from '../modules/castell-draig-rooms/wing-households.mjs';
import { roomModuleId } from '../modules/castell-draig-rooms/wing-layout.mjs';

// Exercise production classic scripts against local section fixtures. All network
// traffic is blocked and the persistence facade records arguments in memory.
const root = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(root, 'diagnostics/scene-transition-20261104');
await mkdir(output, { recursive: true });
const scripts = await Promise.all([
  'core/app-core.js', 'archive/archive-view.js', 'archive/archive-card-meta.js',
  'archive/archive-dashboard.js', 'archive/archive-hierarchy-browser.js',
  'comments/comments-routing.js', 'app/dialog-manager.js',
  'scene-transition/scene-transition-state.js', 'scene-transition/scene-transition-target-picker.js',
  'scene-transition/scene-transition-ui.js', 'scene-transition/scene-transition-events.js'
].map(path => readFile(new URL(`../modules/${path}`, import.meta.url), 'utf8')));
const css = await readFile(new URL('../styles/scene-transition.css', import.meta.url), 'utf8');
const sourceId = 'castell::session:hall';
const targetId = 'castell::session:gawain';
const sections = [
  { key: 'Orte', tab: 'Orte', path: [], entries: [] },
  { key: 'Castell Draig', tab: 'Orte', path: ['Estryll', 'Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor', 'Castell Draig'], entries: [
    { id: 'castell', title: 'Castell Draig', icon: '♜', pages: [
      { pageTitle: 'Thronsaal', sessionPage: true, commentThreadKey: 'hall' },
      { pageTitle: 'Gawains Gemach', sessionPage: true, commentThreadKey: 'gawain' },
      { pageTitle: 'Gwendolyns Gemach', sessionPage: true, commentThreadKey: 'gwendolyn' },
      { pageTitle: 'Geschichte', sessionPage: false }
    ] }
  ] },
  { key: 'Krumme Kanne', tab: 'Orte', path: ['Estryll', 'Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor', 'Stadtviertel'], entries: [
    { id: 'kanne', title: 'Die Krumme Kanne', icon: '♧', pages: [
      { pageTitle: 'Schankraum', sessionPage: true, commentThreadKey: 'taproom' },
      { pageTitle: 'Herluins Gemach', sessionPage: true, commentThreadKey: 'herluin' }
    ] },
    { id: 'no-scene', title: 'Reine Beschreibung', pages: [{ pageTitle: 'Keine Szene' }] }
  ] },
  { key: 'Bruderschaften', tab: 'Bruderschaften', path: [], entries: [] },
  { key: 'Arkaneum', tab: 'Bruderschaften', path: ['Magier', 'Gwynthor'], entries: [
    { id: 'arkaneum', title: 'Arkaneum Gwynthor', icon: '✧', pages: [
      { pageTitle: 'Arbeitszimmer der Magier', sessionPage: true, commentThreadKey: 'study' }
    ] }
  ] }
];
const roomPath = ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor', 'Castell Draig', 'Wohntrakte'];
const residentialSections = DRAIG_WINGS.map(wing => ({ tab: 'Völker & Kulturen', key: wing.title,
  path: [...roomPath, wing.title], entries: DRAIG_HOUSEHOLDS.filter(room => room.wingId === wing.id)
    .map(room => ({ id: roomModuleId(room), title: room.title, multipage: true,
      pages: [{ sessionPage: true, enableComments: true, pageTitle: room.title, commentThreadKey: `wohntrakte-${room.id}` }] })) }));
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const report = [];
try {
  for (const [layout, viewport] of [['desktop', { width: 1400, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    await context.route('**/*', route => route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setContent(`<style>:root { --parchment:#f6efdd; --ink:#382611; --gold:#9b711c; --gold-dark:#70470d; --gold-light:#eedca7; --ink-faded:#735e45; --red-wax:#8a3027; }
      * { box-sizing:border-box; } body { margin:0; background:#eee4cb; font:16px Georgia,serif; } ${css}</style>
      <button type="button" data-scene-transition-action="open-dialog">Szenenwechsel anlegen</button>`);
    await page.addScriptTag({ content: `
      const escapeHtml = value => String(value ?? '').replace(/[&<>\"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
      const sanitizeImageSrc = () => '';
      const parseCommentMarkup = escapeHtml;
      const getInitialChar = value => String(value)[0];
      const COMMENT_DELETE_CODE = 'local-fixture';
      window.savedTransitions = [];
      window.loads = [];
      window.statuses = [];
      const getVisibleCharacterRecords = () => [{id:'gawain', name:'Gawain Draig'}, {id:'gwendolyn', name:'Gwendolyn Draig'}];
      const getRenderableEntry = entry => entry;
      const getPages = entry => entry.pages || [];
      const getCommentBackend = async () => ({ addSceneTransition: async (...args) => { window.savedTransitions.push(args); } });
      const requestCommentAutoScroll = () => {};
      const loadCommentsIntoPage = async (...args) => { window.loads.push(args); };
      const loadSidebarFeed = () => {};
      const showAppStatus = (...args) => window.statuses.push(args);
      const getFriendlyErrorMessage = error => error.message;
    ` });
    for (const script of scripts) await page.addScriptTag({ content: script });
    await page.evaluate(sections => {
      window.fixtureSections = sections;
      getValidSections = () => fixtureSections;
      getCurrentCommentCastIds = () => ['gawain'];
      getCurrentCommentThread = () => ({ kind: 'session', threadId: 'castell::session:hall',
        entry: fixtureSections[1].entries[0], page: fixtureSections[1].entries[0].pages[0] });
    }, sections);
    await page.getByRole('button', { name: 'Szenenwechsel anlegen', exact: true }).click();
    const overlay = page.locator('#scene-transition-overlay');
    await overlay.waitFor({ state: 'visible' });
    const search = overlay.locator('#scene-transition-target-search');
    await search.waitFor();
    assert.equal(await overlay.getAttribute('aria-hidden'), 'false');
    assert.equal(await overlay.getAttribute('role'), 'dialog');
    assert.equal(await overlay.locator(`[data-transition-thread-id="${sourceId}"]`).count(), 0);
    assert.equal(await overlay.locator('[data-target-search]').count(), 5);
    assert.equal(await overlay.getByText('Reine Beschreibung', { exact: true }).count(), 0);
    const hierarchy = await overlay.locator('[data-scene-transition-targets]').evaluate(element =>
      [...element.querySelectorAll('summary .scene-transition-target-label')].map(node => node.textContent));
    for (const label of ['Orte', 'Estryll', 'Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor', 'Castell Draig', 'Stadtviertel', 'Bruderschaften', 'Magier']) {
      assert.ok(hierarchy.includes(label), `Missing Almanach hierarchy label: ${label}`);
    }
    // Preserve a deliberately changed folder state across repeated search terms.
    const folder = overlay.locator('.scene-transition-target-group').filter({ has: page.locator(':scope > summary .scene-transition-target-label', { hasText: /^Cenyr$/ }) }).first();
    await folder.locator(':scope > summary').click();
    const beforeSearch = await overlay.locator('.scene-transition-target-group').evaluateAll(groups => groups.map(group => group.open));
    for (const [query, expected] of [['gemach', 3], ['GAWAIN', 1], ['cenyr gawain', 1], ['GaWaIn DrAiG', 1]]) {
      await search.fill(query);
      assert.equal(await overlay.locator('[data-target-search]:not([hidden])').count(), expected, query);
      assert.equal(await overlay.locator('[data-scene-transition-target-empty]').isVisible(), false);
      assert.equal(await overlay.locator('.scene-transition-target-group > summary > small:visible').count(), 0,
        'Search results must not show unrelated total category counts');
    }
    await search.fill('nichtvorhandenesgemach');
    assert.equal(await overlay.locator('[data-target-search]:not([hidden])').count(), 0);
    assert.equal(await overlay.locator('[data-scene-transition-target-empty]').isVisible(), true);
    await search.fill('');
    assert.deepEqual(await overlay.locator('.scene-transition-target-group').evaluateAll(groups => groups.map(group => group.open)), beforeSearch);
    assert.equal(await overlay.locator('[data-target-search]:not([hidden])').count(), 5);
    await search.fill('cenyr gawain');
    const target = overlay.locator(`[data-scene-transition-action="select-target"][data-transition-thread-id="${targetId}"]`);
    await target.click();
    assert.equal(await overlay.locator('#scene-transition-target').inputValue(), targetId);
    assert.equal(await target.getAttribute('aria-pressed'), 'true');
    assert.equal(await overlay.locator('[data-target-search][aria-pressed="true"]').count(), 1);
    assert.ok((await overlay.locator('[data-scene-transition-target-selection]').textContent()).includes('Gawains Gemach'));
    assert.ok((await overlay.locator('[data-scene-transition-preview]').textContent()).includes('Gawains Gemach'));
    assert.equal(await overlay.locator('[data-scene-transition-preview] [data-scene-transition-action="open-target"]').count(), 0,
      'Preview must not navigate to a different source while the editor is open');
    const submit = overlay.locator('[data-scene-transition-action="submit"]');
    await submit.click();
    assert.ok((await overlay.locator('[data-scene-transition-status]').textContent()).includes('Erzähltext'));
    assert.equal(await page.evaluate(() => savedTransitions.length), 0);
    const narration = 'Gawain geht vom Thronsaal in sein Gemach.';
    await overlay.locator('#scene-transition-text').fill(narration);
    assert.ok((await overlay.locator('[data-scene-transition-preview]').textContent()).includes(narration));
    await overlay.locator('.scene-transition-options > summary').click();
    await overlay.locator('[data-transition-icon-key="ride"]').click();
    await overlay.locator('[data-character-id="gwendolyn"]').click();
    assert.equal(await overlay.locator('[data-character-id="gwendolyn"]').getAttribute('aria-pressed'), 'true');
    const bounds = await overlay.evaluate(element => {
      const dialog = element.querySelector('.scene-transition-dialog');
      const body = element.querySelector('.scene-transition-dialog-body');
      const browser = element.querySelector('[data-scene-transition-targets]');
      return { viewport: innerWidth, width: dialog.clientWidth, scrollWidth: dialog.scrollWidth,
        bodyWidth: body.clientWidth, bodyScrollWidth: body.scrollWidth,
        browserWidth: browser.clientWidth, browserScrollWidth: browser.scrollWidth };
    });
    assert.ok(bounds.scrollWidth <= bounds.width + 2, `${layout}: dialog horizontal overflow`);
    assert.ok(bounds.bodyScrollWidth <= bounds.bodyWidth + 2, `${layout}: body horizontal overflow`);
    assert.ok(bounds.browserScrollWidth <= bounds.browserWidth + 2, `${layout}: destination browser horizontal overflow`);
    await overlay.locator('.scene-transition-options > summary').click();
    await overlay.locator('.scene-transition-dialog-body').evaluate(element => { element.scrollTop = 0; });
    await page.screenshot({ path: resolve(output, `picker-${layout}.png`) });
    await submit.click();
    await overlay.waitFor({ state: 'hidden' });
    const writes = await page.evaluate(() => savedTransitions);
    assert.equal(writes.length, 1);
    assert.equal(writes[0][0], sourceId);
    assert.equal(writes[0][1], targetId);
    assert.equal(writes[0][2], narration);
    const payload = writes[0][4].sceneTransition;
    assert.equal(payload.source.threadId, sourceId);
    assert.equal(payload.target.threadId, targetId);
    assert.equal(payload.flavourText, narration);
    assert.equal(payload.icon.key, 'ride');
    assert.deepEqual(payload.characters.map(character => character.id), ['gawain', 'gwendolyn']);
    assert.deepEqual(await page.evaluate(() => loads), [[sourceId, true, { page: 'last' }]]);
    assert.deepEqual(errors, []);
    report.push({ layout, passed: true, destinations: 5, sourceExcluded: true, hierarchy, searchCases: 5,
      folderStateRestored: true, selectionAndPreview: true, requiredTextValidated: true, savedCopies: 2,
      iconAndCharacters: true, ...bounds });
    // Reuse the actual household catalogue and seven-part Wohntrakte path. This
    // deliberately checks whether a search result is visible before clicking it.
    await page.evaluate(sections => {
      window.fixtureSections = sections;
      getCurrentCommentThread = () => {
        const entry = fixtureSections.flatMap(section => section.entries).find(entry => entry.id === 'castell-draig-gemach-rhiannon');
        return { kind: 'session', threadId: `${entry.id}::session:wohntrakte-rhiannon`, entry, page: entry.pages[0] };
      };
    }, residentialSections);
    await page.getByRole('button', { name: 'Szenenwechsel anlegen', exact: true }).click();
    await overlay.waitFor({ state: 'visible' });
    const browsingScrollBefore = await overlay.locator('[data-scene-transition-targets]').evaluate(element => {
      element.scrollTop = 90;
      return element.scrollTop;
    });
    await search.fill('Gawain');
    await page.waitForTimeout(100);
    const deepSearch = await overlay.locator('[data-scene-transition-targets]').evaluate(element => {
      const target = element.querySelector('[data-target-search]:not([hidden])');
      const browser = element.getBoundingClientRect();
      const button = target.getBoundingClientRect();
      return { path: target.dataset.targetPath, count: element.querySelectorAll('[data-target-search]:not([hidden])').length,
        groups: element.querySelectorAll('.scene-transition-target-group[open]:not([hidden])').length,
        scrollTop: element.scrollTop, visible: button.top >= browser.top && button.bottom <= browser.bottom,
        browserTop: browser.top, browserBottom: browser.bottom, targetTop: button.top, targetBottom: button.bottom,
        horizontalOverflow: element.scrollWidth > element.clientWidth + 2 };
    });
    assert.equal(deepSearch.count, 1);
    assert.ok(deepSearch.path.includes('Castell Draig > Wohntrakte > Grafenflügel'));
    assert.equal(deepSearch.horizontalOverflow, false);
    assert.ok(deepSearch.visible, `${layout}: the deep household search result must appear inside the destination browser`);
    await page.screenshot({ path: resolve(output, `picker-deep-search-${layout}.png`) });
    await search.fill('');
    assert.equal(await overlay.locator('[data-scene-transition-targets]').evaluate(element => element.scrollTop), browsingScrollBefore,
      'Clearing a deep search restores the previous destination browser scroll position');
    deepSearch.browsingScrollRestored = true;
    report.at(-1).canonicalResidentialSearch = deepSearch;
    await context.close();
  }
  await writeFile(resolve(output, 'picker-report.json'), `${JSON.stringify({ passed: true, networkBlocked: true, fixtureOnly: true, report }, null, 2)}\n`);
  console.log(JSON.stringify({ passed: true, layouts: report.length, output }));
} finally {
  await browser.close();
}
