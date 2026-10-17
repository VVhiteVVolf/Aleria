import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const { chromium } = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : 'playwright');

const root = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const output = resolve(root, '.codex-temp/character-performance');
await mkdir(output, { recursive: true });
const snapshot = JSON.parse(await readFile(resolve(root, 'CharakterDatenbank/generated/characters.snapshot.json'), 'utf8'));
const errors = [];
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const path = resolve(root, '.' + decodeURIComponent(url.pathname));
  if (!path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
  try {
    let body;
    try { body = await readFile(path); }
    catch { body = await readFile(path.replace('AleriaAlmanach' + sep, 'AleriaAlmanach' + sep + 'public' + sep)); }
    res.setHeader('Content-Type', ({ '.html': 'text/html;charset=utf-8', '.js': 'text/javascript;charset=utf-8', '.mjs': 'text/javascript;charset=utf-8', '.css': 'text/css;charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp' })[extname(path)] || 'application/octet-stream');
    res.end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' && !route.request().url().includes('/firebase.js') ? route.continue() : route.abort());
  await page.goto(`http://127.0.0.1:${server.address().port}/AleriaAlmanach/AleriaAlmanach.html`, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.AleriaCharacterCombatProfile && typeof openCharProfile === 'function');
  await page.evaluate(snapshot => {
    _characters = snapshot.characters;
    _charactersLoaded = true;
    _charTabsLoaded = true;
    const tabs = snapshot.charTabs || {};
    _charTabs = tabs.tabs || ['Alle']; _charTabMap = tabs.map || {};
    _charSubtabs = tabs.subtabs || {}; _charSubtabMap = tabs.subtabMap || {};
  }, snapshot);
  const results = await page.evaluate(() => {
    const measurements = [];
    const names = ['Rhiannon', 'Gawain', 'Freya', 'Sleipnir'];
    for (const name of names) {
      const character = _characters.find(c => c.name?.includes(name));
      if (!character) continue;
      const stages = {};
      const functions = ['initCharacterImageSetEditor', 'initCharacterInventoryProfile', 'initCharacterBiographyTab', 'collectCharacterEquipmentProfileData'];
      const originals = new Map();
      for (const key of functions) {
        originals.set(key, window[key]);
        window[key] = (...args) => { const start = performance.now(); const result = originals.get(key)(...args); stages[key] = (stages[key] || 0) + performance.now() - start; return result; };
      }
      const start = performance.now(); openCharProfile(character.id); const elapsed = performance.now() - start;
      measurements.push({ name: character.name, milliseconds: elapsed, stages, nodes: document.getElementById('char-profile-overlay').querySelectorAll('*').length, unsaved: getUnsavedCharacterProfileSectionLabels() });
      for (const [key, original] of originals) window[key] = original;
      closeCharProfile({ skipUnsavedCheck: true });
    }
    return measurements;
  });
  const safety = await page.evaluate(async () => {
    const character = _characters.find(c => c.name?.includes('Gawain'));
    const original = JSON.stringify(character);
    const checks = [];
    function check(ok, label) { if (!ok) throw Error(label); checks.push(label); }
    openCharProfile(character.id);
    check(!document.querySelector('#cp-combat-sheet-root *'), 'Combat stays unmounted when opening the profile');
    check(!document.querySelector('#cp-inventory-editor *'), 'Inventory stays unmounted when opening the profile');
    check(!document.querySelector('#cp-biography-editor *'), 'Biography stays unmounted when opening the profile');
    switchCharTab('inventory');
    check(!!document.querySelector('#cp-inventory-editor *'), 'Inventory mounts on first visit');
    check(getUnsavedCharacterProfileSectionLabels().length === 0, 'Inventory initialization does not count as an edit');
    switchCharTab('combat');
    check(!!document.querySelector('#cp-combat-sheet-root *'), 'Combat mounts on first visit');
    check(getUnsavedCharacterProfileSectionLabels().length === 0, 'Combat initialization does not count as an edit');
    switchCharTab('biography');
    check(!!document.querySelector('#cp-biography-editor *'), 'Biography mounts on first visit');
    check(getUnsavedCharacterProfileSectionLabels().length === 0, 'Biography initialization does not count as an edit');
    _characterBiographyEditMode = true;
    renderCharacterBiographyPanel();
    const input = document.querySelector('#cp-biography-editor input, #cp-biography-editor textarea');
    input.value = 'Unsaved biography edit';
    switchCharTab('info'); switchCharTab('biography');
    check(input.isConnected && input.value === 'Unsaved biography edit', 'Biography edits survive tab changes');
    check(JSON.stringify(character) === original, 'Opening all tabs preserves the source character');
    closeCharProfile({ skipUnsavedCheck: true });

    const writes = [];
    window._fb = { async saveCharacter(id, data) { writes.push(data); return { id: id || 'performance-new', data }; } };
    window.AleriaCharacterArchive = { archiveRecord: async () => {} };
    for (const equipmentOpened of [false, true]) {
      openCharProfile(character.id);
      if (equipmentOpened) switchCharTab('combat');
      const idx = _characters.findIndex(c => c.id === character.id);
      _characters[idx] = { ..._characters[idx], combatProfile: { ..._characters[idx].combatProfile, revision: 9999999999999, hitPoints: { ..._characters[idx].combatProfile.hitPoints, current: 1 } } };
      const liveProfile = JSON.stringify(_characters[idx].combatProfile);
      document.getElementById('cp-title').value += ' (performance test)';
      await saveCharacter();
      const write = writes.at(-1);
      check(write && !('inventory' in write) && !('combatProfile' in write) && !('biography' in write), `Profile save omits untouched sections (equipment opened: ${equipmentOpened})`);
      check(JSON.stringify(getCharacterById(character.id).combatProfile) === liveProfile, 'A newer live combat profile survives profile saving');
      check(getUnsavedCharacterProfileSectionLabels().length === 0, 'Saved profile has a clean baseline');
      closeCharProfile({ skipUnsavedCheck: true });
    }
    openCharProfile(null);
    document.getElementById('cp-name').value = 'Performance test new character';
    await saveCharacter();
    check(!!writes.at(-1)?.combatProfile?.attributes && !!writes.at(-1)?.inventory?.categories, 'New characters receive complete equipment defaults on saving');
    closeCharProfile({ skipUnsavedCheck: true });
    return checks;
  });
  const pagination = await page.evaluate(() => {
    _characters = Array.from({ length: 1100 }, (_, i) => ({ id: 'person-' + i, name: 'Testperson ' + String(i).padStart(4, '0'), bio: 'Pagination', fraktion: 'Testfraktion' }));
    _charTabs = ['Alle', 'Testgruppe']; _charTabMap = { Testgruppe: _characters.map(c => c.id) };
    _charSubtabs = {}; _charSubtabMap = {}; _hiddenBuiltinCharacterIds = new Set();
    const block = document.createElement('section'); block.className = 'section-block'; block.dataset.tab = 'Charaktere'; block.innerHTML = '<div id="char-subtabs"></div><div id="char-grid"></div>';
    document.getElementById('main-content').replaceChildren(block);
    document.querySelector('[data-loading-screen]')?.remove();
    delete document.documentElement.dataset.almanachLoading;
    const content = document.querySelector('[data-almanach-content]');
    content.inert = false; content.removeAttribute('aria-hidden');
    _activeTab = 'Charaktere'; _activeCharTab = 'Testgruppe'; _activeCharSubtab = 'Alle';
    renderCharGrid();
    const count = () => document.querySelectorAll('#char-grid [data-character-grid-action="open-character"]').length;
    if (count() !== 36) throw Error('Group should render 36 cards, got ' + count());
    const firstId = document.querySelector('#char-grid [data-char-id]').dataset.charId;
    document.querySelector('[data-character-page="1"]').click();
    if (count() !== 36 || document.querySelector('#char-grid [data-char-id]').dataset.charId === firstId) throw Error('Next page failed');
    _characterRegisterSearch = 'Testperson 1099'; renderCharGrid();
    if (count() !== 1 || !document.querySelector('[data-char-id="person-1099"]')) throw Error('Search must find the last record from every page');
    _characterRegisterSearch = ''; _activeCharTab = 'Alle'; setCharacterRegisterViewMode('categories', { render: false });
    renderCharGrid();
    // Search results exercise the category browser independently of manual groups.
    _characterRegisterSearch = 'Testperson'; renderCharGrid();
    if (count() !== 36) throw Error('Search results should be paged, got ' + count());
    return { records: _characters.length, renderedCards: count(), searchBeyondFirstPage: true, navigation: true };
  });
  await page.setViewportSize({ width: 390, height: 844 });
  const overflow = await page.locator('.char-result-pages').evaluate(nav => nav.scrollWidth > nav.clientWidth + 1);
  assert.equal(overflow, false, 'Page navigation fits mobile width');
  await page.locator('.char-result-pages').scrollIntoViewIfNeeded();
  await page.screenshot({ path: resolve(output, 'pagination-mobile.png') });
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ count: snapshot.characters.length, results, safety, pagination, errors }, null, 2));
  await writeFile(resolve(output, 'report.json'), JSON.stringify({ results, safety, pagination, errors }, null, 2));
} finally { await browser.close(); await new Promise(done => server.close(done)); }
