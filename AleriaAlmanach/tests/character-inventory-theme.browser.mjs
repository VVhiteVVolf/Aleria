import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';

// Real possessions, copied into an isolated local UI. No save, trade or online
// publication action is invoked; the preview helper blocks external writes.
const source = JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url), 'utf8'));
const character = source.characters.find(value => value.name === 'Gais Wyrm');
assert(character?.inventory, 'Gais inventory fixture is required.');
const fixture = structuredClone(character);
fixture.inventory.name = fixture.name;
fixture.inventory.characterId = fixture.id;

const preview = await openVenueBrowserPreview('inventory-theme-20261102');
const { page } = preview;
const checks = [], views = [];
const radarBounds = [];
const record = label => checks.push(label);
const scope = '#cp-inventory-editor .character-inventory-page';
async function assertNoOverflow(selector, label) {
  const bounds = await page.locator(selector).evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth }));
  assert.ok(bounds.width > 0 && bounds.scroll <= bounds.width + 2, `${label}: ${JSON.stringify(bounds)}`);
  return { label, ...bounds };
}
async function decodeInventoryImages(selector) {
  const results = await page.locator(selector).evaluateAll(async elements => {
    await Promise.all(elements.map(image => { image.loading = 'eager'; return image.decode().catch(() => {}); }));
    return elements.filter(image => !image.naturalWidth).map(image => image.getAttribute('src'));
  });
  assert.deepEqual(results, [], 'Inventory art and UI icons must load.');
}
async function closeStatusMessages() {
  for (const button of await page.locator('[data-action="dismiss-app-status"]').all()) if (await button.isVisible()) await button.click();
}
async function assertRadarLabelsInsideViewBox(selector, label) {
  const result = await page.locator(selector).evaluate(async svg => {
    await document.fonts.ready;
    const { x, y, width, height } = svg.viewBox.baseVal;
    const bounds = Array.from(svg.querySelectorAll('text')).map(text => {
      const box = text.getBBox();
      return { text: text.textContent, x: box.x, y: box.y, width: box.width, height: box.height,
        inside: box.x >= x - 0.1 && box.y >= y - 0.1 && box.x + box.width <= x + width + 0.1 && box.y + box.height <= y + height + 0.1 };
    });
    return { viewBox: { x, y, width, height }, renderedWidth: svg.getBoundingClientRect().width, bounds };
  });
  assert.ok(result.bounds.length > 0 && result.bounds.every(box => box.inside), `${label}: clipped radar labels: ${JSON.stringify(result)}`);
  radarBounds.push({ label, ...result });
}
try {
  await page.setViewportSize({ width: 1680, height: 1050 });
  await closeStatusMessages();
  await page.evaluate(character => {
    openCharProfile(null); switchCharTab('inventory'); initCharacterInventoryProfile(character);
    document.getElementById('cp-name').value = character.name;
  }, fixture);
  await page.locator(scope).waitFor();
  const baseline = await page.evaluate(() => collectCharacterInventoryProfileData());
  const rows = page.locator(`${scope} .ci-item-row`);
  assert.equal(await rows.count(), 3);
  assert.equal(await page.locator(`${scope} [data-ci-action="show-companion"]`).count(), 1);
  assert.equal(await page.locator(`${scope} [data-ci-money-field]`).count(), 0);
  assert.equal(await page.locator(`${scope} [data-ci-action="equip-item-from-register"]`).count(), 0);
  assert.equal(await page.locator(scope).getAttribute('data-ci-readonly'), 'true');
  record('character inventory keeps read-only controls');

  const search = page.locator(`${scope} [data-ci-search]`);
  await search.fill('Langschwert');
  assert.equal(await page.locator(`${scope} .ci-item-row:visible`).count(), 1);
  assert.match(await page.locator(`${scope} .ci-live-preview`).innerText(), /Langschwert/);
  await search.fill('qa-ohne-treffer');
  assert.equal(await page.locator(`${scope} .ci-item-row:visible`).count(), 0);
  assert.equal(await page.locator(`${scope} [data-ci-empty]`).isVisible(), true);
  await search.fill('');
  await page.locator(`${scope} [data-ci-action="filter-items"][data-ci-category="armor"]`).click();
  assert.equal(await page.locator(`${scope} .ci-item-row:visible`).count(), 1);
  assert.match(await page.locator(`${scope} .ci-live-preview`).innerText(), /Kettenhemd/);
  await page.locator(`${scope} [data-ci-action="filter-items"][data-ci-category="weapon"]`).click();
  assert.equal(await page.locator(`${scope} .ci-item-row:visible`).count(), 2);
  await page.locator(`${scope} [data-ci-action="filter-items"][data-ci-category=""]`).click();
  record('search, empty results and categories update selection and preview');

  const swordId = fixture.inventory.items.find(item => item.name === 'Langschwert').id;
  await page.locator(`${scope} [data-ci-action="select-item"][data-ci-item-id="${swordId}"]`).click();
  assert.equal(await page.locator(scope).getAttribute('data-ci-selected-id'), swordId);
  await page.locator(`${scope} .ci-card-open`).click();
  const modal = page.locator(`${scope} dialog.ci-profile-overlay[open]`);
  await modal.waitFor();
  assert.match(await modal.innerText(), /Langschwert/);
  assert.match(await modal.innerText(), /1W8|1d8/i);
  assert.equal(await modal.locator('[data-ci-action="edit-item"]').count(), 0);
  await modal.locator('.ci-card-diagram > summary').click();
  assert.equal(await modal.locator('.ci-card-radar svg').isVisible(), true);
  await decodeInventoryImages(`${scope} dialog[open] img`);
  await preview.capture('item-card-desktop');
  await modal.locator('[data-ci-action="close-profile"]').click();
  assert.equal(await page.locator(`${scope} dialog.ci-profile-overlay`).getAttribute('open'), null);
  assert.deepEqual(await page.evaluate(() => collectCharacterInventoryProfileData()), baseline);
  record('item card, facts, diagram and close preserve possession data');

  // Exercise the real creature-link event with a local gateway, without loading
  // or changing a live creature record.
  await page.evaluate(() => {
    globalThis.inventoryQaCreatureGateway = window.AleriaCreatures;
    globalThis.inventoryQaCreatureCalls = [];
    window.AleriaCreatures = { getAll: () => [], getById: id => ({ id }), open: id => inventoryQaCreatureCalls.push(id) };
  });
  await page.locator(`${scope} [data-ci-action="show-companion"]`).click();
  const companionModal = page.locator(`${scope} dialog[open]`);
  const expectedCreatureId = fixture.inventory.companions[0].creatureId;
  assert.equal(await companionModal.locator('[data-ci-action="open-creature"]').getAttribute('data-ci-creature-id'), expectedCreatureId);
  await companionModal.locator('[data-ci-action="open-creature"]').click();
  assert.deepEqual(await page.evaluate(() => inventoryQaCreatureCalls), [expectedCreatureId]);
  await page.evaluate(() => { window.AleriaCreatures = inventoryQaCreatureGateway; delete globalThis.inventoryQaCreatureGateway; });
  record('companion card keeps its exact creature-sheet identity');

  const requiredIcons = await page.locator(`${scope} .ci-tabs button, ${scope} .ci-item-card-button, ${scope} .ci-card-open`).evaluateAll(buttons => buttons.filter(button => !button.querySelector('img.ci-ui-icon')).map(button => button.textContent.trim()));
  assert.deepEqual(requiredIcons, [], 'Categories and card actions require real image icons.');
  await decodeInventoryImages(`${scope} img`);
  const originalArt = await page.locator(`${scope} .ci-item-row .ci-item-icon`).evaluateAll(images => images.map(image => image.getAttribute('src')));
  assert.ok(originalArt.length === 3 && originalArt.every(src => src && !src.includes('/inventory-ui/')), 'Actual Gais item art must remain separate from UI thumbnails.');
  record('category icons, item art, currency and action icons load');

  for (const [name, size] of [['desktop-1680', { width: 1680, height: 1050 }], ['desktop-1440', { width: 1440, height: 1000 }], ['phone-390', { width: 390, height: 844 }], ['phone-320', { width: 320, height: 812 }]]) {
    await page.setViewportSize(size);
    await search.scrollIntoViewIfNeeded();
    const bounds = await assertNoOverflow(scope, name);
    await page.locator(`${scope} [data-ci-action="filter-items"][data-ci-category="armor"]`).click();
    assert.match(await page.locator(`${scope} .ci-live-preview`).innerText(), /Kettenhemd/);
    await page.locator(`${scope} [data-ci-action="filter-items"][data-ci-category=""]`).click();
    if (size.width <= 390) {
      await page.locator(`${scope} .ci-item-card-button`).first().click();
      await assertNoOverflow(`${scope} dialog[open]`, name + ' item dialog');
      await preview.capture(name + '-item-card');
      await page.locator(`${scope} dialog[open] [data-ci-action="close-profile"]`).click();
      await search.scrollIntoViewIfNeeded();
    }
    await closeStatusMessages();
    await preview.capture(name);
    views.push({ name, ...bounds });
  }
  assert.deepEqual(await page.evaluate(() => collectCharacterInventoryProfileData()), baseline);
  record('desktop and mobile controls remain usable without horizontal overflow');

  await page.evaluate(character => {
    // Dispose this unsaved local test fixture before opening a standalone module.
    closeCharProfile({ skipUnsavedCheck: true });
    const inventory = { ...character.inventory, moneyState: CharacterInventoryMoney.splitCopper(100), name: character.name };
    openModal({ id: 'inventory-theme-qa', title: 'Lokale Inventarprüfung', multipage: true, pages: [{ characterInventoryPage: true, characterInventory: inventory }] }, { pageIndex: 0 });
  }, fixture);
  await page.setViewportSize({ width: 1440, height: 1000 });
  const moduleScope = '#modal-overlay .character-inventory-page';
  assert.equal(await page.locator(moduleScope).getAttribute('data-ci-readonly'), 'false');
  assert.equal(await page.locator(`${moduleScope} [data-ci-money-field]`).count(), 4);
  await page.locator(`${moduleScope} [data-ci-transaction-field="silver"]`).fill('2');
  await page.locator(`${moduleScope} [data-ci-transaction-field="copper"]`).fill('3');
  await page.locator(`${moduleScope} [data-ci-transaction-field="pfennig"]`).fill('50');
  await page.locator(`${moduleScope} [data-ci-transaction-direction="add"]`).click();
  const money = () => page.locator(moduleScope).evaluate(el => getCharacterInventoryPageData(el).moneyState.totalCopper);
  assert.equal(await money(), 303.5);
  await page.locator(`${moduleScope} [data-ci-transaction-field="copper"]`).fill('50');
  await page.locator(`${moduleScope} [data-ci-transaction-field="pfennig"]`).fill('25');
  await page.locator(`${moduleScope} [data-ci-transaction-direction="subtract"]`).click();
  assert.equal(await money(), 253.25);
  await page.locator(`${moduleScope} [data-ci-transaction-field="gold"]`).fill('99');
  await page.locator(`${moduleScope} [data-ci-transaction-direction="subtract"]`).click();
  assert.equal(await money(), 253.25);
  assert.match(await page.locator(`${moduleScope} .ci-money-status`).innerText(), /Nicht genug Münzen/);
  assert.equal(await page.locator(`${moduleScope} .ci-money-actions button img.ci-ui-icon`).count(), 2);
  await decodeInventoryImages(`${moduleScope} img`);
  await preview.capture('editable-money-desktop');
  record('editable gold/silver/copper/pfennig transactions preserve exact totals and reject overdrafts');

  const unchangedItems = await page.locator(moduleScope).evaluate(el => getCharacterInventoryPageData(el).items);
  await page.locator(`${moduleScope} .ci-item-card-button`).first().click();
  await page.locator(`${moduleScope} dialog[open] [data-ci-action="edit-item"]`).click();
  const editModal = page.locator(`${moduleScope} dialog[open] [data-ci-editing-item]`);
  await editModal.locator('[data-ci-modal-field="description"]').fill('Nur eine lokale Vorschau, kein Speicherauftrag.');
  assert.match(await editModal.locator('.ci-modal-live-preview').innerText(), /Nur eine lokale Vorschau/);
  await assertRadarLabelsInsideViewBox(`${moduleScope} dialog[open] .ci-modal-live-preview .ci-radar svg`, 'editor-desktop');
  await preview.capture('editable-item-form-desktop');
  await page.setViewportSize({ width: 320, height: 844 });
  await editModal.locator('.ci-modal-live-preview').scrollIntoViewIfNeeded();
  await assertRadarLabelsInsideViewBox(`${moduleScope} dialog[open] .ci-modal-live-preview .ci-radar svg`, 'editor-phone-320');
  await assertNoOverflow(`${moduleScope} dialog[open]`, 'editor-phone-320');
  await preview.capture('editable-item-radar-phone-320');
  await editModal.locator('[data-ci-action="cancel-item-edit"]').click();
  await page.locator(`${moduleScope} dialog[open] [data-ci-action="close-profile"]`).click();
  assert.deepEqual(await page.locator(moduleScope).evaluate(el => getCharacterInventoryPageData(el).items), unchangedItems);
  record('item editor live preview and cancel preserve original item definitions');

  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.locator(`${moduleScope} [data-ci-transaction-field="copper"]`).fill('1');
    await page.locator(`${moduleScope} [data-ci-transaction-direction="add"]`).click();
    assert.equal(await money(), 254.25);
    await page.locator(`${moduleScope} [data-ci-transaction-field="copper"]`).fill('1');
    await page.locator(`${moduleScope} [data-ci-transaction-direction="subtract"]`).click();
    assert.equal(await money(), 253.25);
    views.push(await assertNoOverflow(moduleScope, 'editable-phone-' + width));
    await assertNoOverflow(`${moduleScope} .ci-money-panel`, 'money-phone-' + width);
    await preview.capture('editable-money-phone-' + width);
  }
  record('editable money controls remain operable at 390 and 320 pixels');

  const textures = await page.locator(moduleScope).evaluate(el => {
    const urls = new Set();
    for (const target of [el, ...el.querySelectorAll('*')]) for (const pseudo of [null, '::before', '::after']) {
      for (const match of getComputedStyle(target, pseudo).backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g)) urls.add(new URL(match[1], document.baseURI).href);
    }
    return [...urls];
  });
  assert.ok(textures.length > 0, 'The inventory skin should load its authored background texture.');
  const brokenTextures = await page.evaluate(async urls => {
    const results = await Promise.all(urls.map(async url => { const image = new Image(); image.src = url; await image.decode().catch(() => {}); return image.naturalWidth ? '' : url; }));
    return results.filter(Boolean);
  }, textures);
  assert.deepEqual(brokenTextures, []);
  assert.ok(textures.every(url => /\/inventory-ui\/dark-hide-v1\.webp$/.test(url)), 'Inventory materials must use the optimized WebP derivative.');
  const uiThumbnails = await page.evaluate(async () => Promise.all(['all','weapon','armor','equipment','potions','documents','artifact','companion','other','open','edit','wallet'].map(async key => {
    const source = getCharacterInventoryUiIconSource(key), image = new Image();
    image.src = source; await image.decode().catch(() => {});
    return { key, source, width: image.naturalWidth, height: image.naturalHeight };
  })));
  assert.equal(new Set(uiThumbnails.map(image => image.source)).size, 12);
  assert.ok(uiThumbnails.every(image => /\/inventory-ui\/icons\/[^/]+\.webp$/.test(image.source) && image.width > 0 && image.width <= 256 && image.height <= 256), 'All twelve optimized UI thumbnails must load.');
  record('authored background texture loads');
  record('desktop and 320px radar labels stay inside the SVG viewBox; twelve UI thumbnails preserve original item art');
  assert.deepEqual(preview.errors, []);
  const report = { passed: true, fixture: { id: fixture.id, name: fixture.name, inventoryRows: 3, companions: 1 }, checks, views, textures, radarBounds, uiThumbnails, originalArt, externalWritesBlocked: true, errors: preview.errors, output: preview.output };
  await writeFile(resolve(preview.output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  const diagnosis = new URL('../../diagnostics/inventory-theme-20261102/', import.meta.url);
  await mkdir(diagnosis, { recursive: true });
  await writeFile(new URL('browser-verification.json', diagnosis), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
} catch (error) {
  await preview.capture('failure');
  await writeFile(resolve(preview.output, 'failure.json'), JSON.stringify({ message: error.message, checks, views, errors: preview.errors }, null, 2) + '\n');
  throw error;
} finally { await preview.close(); }
