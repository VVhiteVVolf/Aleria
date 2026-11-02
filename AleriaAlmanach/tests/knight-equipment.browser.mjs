import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { KNIGHT_EQUIPMENT_TARGETS } from '../modules/gwynthor-seven/knight-equipment-plan.mjs';
import { getArmorClass, sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';

const directory = new URL('../../diagnostics/knight-equipment-20261102/', import.meta.url);
const starting = process.argv.includes('--starting');
const fixtureName = starting ? 'starting-characters-after.json' : 'characters-prepared.json';
const reportName = starting ? 'browser-starting-integration' : 'browser-integration';
const fixtureText = await readFile(new URL(fixtureName, directory), 'utf8');
const { characters } = JSON.parse(fixtureText);
assert.equal(characters.length, 4);
const preview = await openVenueBrowserPreview(starting ? 'knight-equipment-starting-20261102' : 'knight-equipment-20261102');
const { page } = preview;
const scope = '#cp-inventory-editor .character-inventory-page';
const results = [];
const expectedCounts = { 'caralyn-chwedlonol': 8, 'rianna-wyrm': 3, 'lefraye-gafyr': 9, 'oweta-draig': 3 };
const expectedMoney = { 'caralyn-chwedlonol': 680, 'rianna-wyrm': 1840, 'lefraye-gafyr': 760, 'oweta-draig': 1250 };
const artworkUrls = [...new Set(characters.flatMap(character => character.inventory.items)
  .filter(item => !item.creatureId && item.category !== 'companion').map(item => item.image))];
const allowedArtwork = new Set(artworkUrls.filter(url => url.startsWith('https://firebasestorage.googleapis.com/')));
const imageCache = new Map();
// Preserve the helper's write block while allowing these exact published images.
await page.route('https://firebasestorage.googleapis.com/**', async route => {
  const request = route.request();
  if (request.method() !== 'GET' || !allowedArtwork.has(request.url())) return route.abort();
  if (!imageCache.has(request.url())) imageCache.set(request.url(), fetch(request.url(), { signal: AbortSignal.timeout(30000) })
    .then(async response => ({ status: response.status, contentType: response.headers.get('content-type'),
      headers: { 'access-control-allow-origin': '*' }, body: Buffer.from(await response.arrayBuffer()) })));
  return route.fulfill(await imageCache.get(request.url()));
});

async function resetScroll(selector) {
  await page.locator(selector).evaluate(element => {
    for (let node = element; node; node = node.parentElement) { node.scrollTop = 0; node.scrollLeft = 0; }
  });
}
async function noOverflow(selector) {
  const box = await page.locator(selector).evaluate(element => ({ width: element.clientWidth, scrollWidth: element.scrollWidth }));
  assert.ok(box.width > 0 && box.scrollWidth <= box.width + 2, JSON.stringify(box));
  return box;
}
async function assertImages(selector) {
  const images = await page.locator(selector).evaluateAll(async elements => {
    await Promise.all(elements.map(async image => { image.loading = 'eager'; await image.decode().catch(() => {}); }));
    return elements.map(image => ({ src: image.getAttribute('src'), width: image.naturalWidth, height: image.naturalHeight }));
  });
  assert.deepEqual(images.filter(image => !image.width), [], 'Every displayed equipment picture and UI icon must load.');
  return images;
}
async function openItem(id) {
  await page.locator(`${scope} .ci-item-row [data-ci-action="show-item"][data-ci-item-id="${id}"]`).click();
  const dialog = page.locator(`${scope} dialog[open]`);
  await dialog.waitFor();
  assert.equal(await dialog.locator('[data-ci-action="edit-item"]').count(), 0);
  return dialog;
}
async function closeItem() {
  await page.locator(`${scope} dialog[open] [data-ci-action="close-profile"]`).click();
}

try {
  const artwork = await page.evaluate(async urls => Promise.all(urls.map(async src => {
    const image = new Image(); image.src = src;
    await image.decode().catch(() => {});
    return { src, width: image.naturalWidth, height: image.naturalHeight };
  })), artworkUrls);
  if (!starting) assert.equal(artwork.length, 20);
  assert.deepEqual(artwork.filter(image => !image.width), [], 'Exact authored images must decode independently of UI fallbacks.');
  await page.evaluate(characters => { _characters = structuredClone(characters); }, characters);
  for (const spec of KNIGHT_EQUIPMENT_TARGETS) {
    const character = characters.find(c => c.identity?.worldPersonId === spec.worldPersonId || spec.knownIds.includes(c.id));
    assert.ok(character, spec.name);
    const loadout = character.inventory.items.filter(item => item.templateId?.startsWith('gwynthor-seven:') && !item.id.includes('-start-possessions-'));
    assert.equal(loadout.length, expectedCounts[spec.key]);
    const ordinary = character.inventory.items.filter(item => !item.creatureId && item.category !== 'companion');
    const weapon = loadout.find(item => item.category === 'weapon');
    const armor = loadout.find(item => item.category === 'armor');
    await page.setViewportSize({ width: 1680, height: 1050 });
    await page.evaluate(id => {
      closeCharProfile({ skipUnsavedCheck: true });
      openCharProfile(id); switchCharTab('inventory');
    }, character.id);
    await page.locator(scope).waitFor();
    const owners = await page.locator(scope).evaluate(element => ({ page: getCharacterInventoryPageData(element).characterId,
      draft: collectCharacterInventoryProfileData().characterId }));
    assert.deepEqual(owners, { page: character.id, draft: character.id }, 'Both inventory sync directions must retain the actual profile owner.');
    assert.equal(await page.locator(scope).getAttribute('data-ci-readonly'), 'true');
    assert.equal(await page.locator(`${scope} [data-ci-money-field]`).count(), 0);
    const names = await page.locator(`${scope} .ci-item-row .ci-item-select strong`).allTextContents();
    assert.deepEqual(names.sort(), ordinary.map(item => item.name).sort());
    const companionNames = await page.locator(`${scope} .ci-companion-heading strong`).allTextContents();
    const inventoryHeading = await page.locator(`${scope} .ci-owner .ci-section-kicker`).textContent();
    assert.equal(inventoryHeading, character.inventory.name ?? character.name, `${spec.name}: header must retain the inventory name or use the actual profile context`);
    if (spec.key === 'oweta-draig') assert.deepEqual(companionNames, ['Heulwen']);
    const images = await assertImages(`${scope} img`);
    for (const item of ordinary) {
      const image = page.locator(`${scope} .ci-item-row[data-ci-item-id="${item.id}"] img.ci-item-icon`);
      assert.equal(await image.getAttribute('src'), item.image);
      assert.ok(await image.evaluate(element => element.naturalWidth > 0), `${spec.name}: original image ${item.id}`);
    }
    const desktop = await noOverflow(scope);
    const personal = ordinary.filter(item => item.id.includes('-start-possessions-'));
    let wallet = null;
    if (starting) {
      assert.equal(personal.length, 3);
      assert.equal(character.inventory.items.length, expectedCounts[spec.key] + 3 + (spec.key === 'oweta-draig' ? 1 : 0));
      wallet = await page.locator(scope).evaluate(element => getCharacterInventoryPageData(element).moneyState);
      assert.equal(wallet.totalCopper, expectedMoney[spec.key]);
      for (const currency of ['gold', 'silver', 'copper', 'pfennig']) {
        const value = await page.locator(`${scope} .ci-money-summary-item.ci-coin-${currency} strong`).textContent();
        assert.equal(Number(value), wallet[currency] || 0);
      }
      await page.locator(`${scope} .ci-money-panel`).scrollIntoViewIfNeeded();
      await page.locator(`${scope} .ci-money-panel`).screenshot({ path: resolve(preview.output, `${spec.key}-wallet-desktop.png`) });
      for (const item of personal) {
        await page.locator(`${scope} [data-ci-search]`).fill(item.name);
        assert.ok(await page.locator(`${scope} .ci-item-row:visible`).count() >= 1);
      }
      await page.locator(`${scope} [data-ci-search]`).fill('');
      if (spec.key === 'oweta-draig') {
        const tinKnight = personal.find(item => item.name === 'Kleiner Zinnritter');
        assert.ok(tinKnight?.image.startsWith('https://firebasestorage.googleapis.com/'));
        const tinCard = await openItem(tinKnight.id);
        assert.equal(await tinCard.locator('.ci-card-title h3').textContent(), tinKnight.name);
        await assertImages(`${scope} dialog[open] img`);
        await tinCard.screenshot({ path: resolve(preview.output, 'oweta-zinnritter-desktop.png') });
        await closeItem();
      }
    }

    const search = page.locator(`${scope} [data-ci-search]`);
    await search.fill(weapon.name);
    assert.equal(await page.locator(`${scope} .ci-item-row:visible`).count(), ordinary.filter(item => item.name.toLocaleLowerCase('de').includes(weapon.name.toLocaleLowerCase('de'))).length);
    assert.match(await page.locator(`${scope} .ci-live-preview`).innerText(), new RegExp(weapon.name));
    await search.fill('');
    for (const category of ['weapon', 'armor']) {
      await page.locator(`${scope} [data-ci-action="filter-items"][data-ci-category="${category}"]`).click();
      assert.equal(await page.locator(`${scope} .ci-item-row:visible`).count(), ordinary.filter(item => item.category === category).length);
    }
    let dialog = await openItem(armor.id);
    assert.match(await dialog.locator('.ci-card-facts').innerText(), /15 RK/);
    await dialog.locator('[data-ci-action="open-item-sheet"]').click();
    assert.equal(await page.locator('#cp-tab-combat').evaluate(panel => panel.classList.contains('active')), true,
      `${spec.name}: armor-card action must open the combat sheet`);
    assert.equal(await page.locator('#cp-name').inputValue(), character.name);
    await page.locator('[data-char-profile-tab="inventory"]').click();
    await page.locator(`${scope} [data-ci-action="filter-items"][data-ci-category=""]`).click();
    await page.locator(`${scope} [data-ci-action="select-item"][data-ci-item-id="${weapon.id}"]`).click();
    await resetScroll(scope);
    await page.locator(scope).screenshot({ path: resolve(preview.output, `${spec.key}-inventory-desktop.png`) });
    dialog = await openItem(weapon.id);
    assert.match(await dialog.locator('.ci-card-facts').innerText(), /1W8/);
    await assertImages(`${scope} dialog[open] img`);
    await dialog.screenshot({ path: resolve(preview.output, `${spec.key}-item-desktop.png`) });
    await closeItem();

    await page.setViewportSize({ width: 390, height: 844 });
    await search.scrollIntoViewIfNeeded();
    const mobile = await noOverflow(scope);
    dialog = await openItem(weapon.id);
    await noOverflow(`${scope} dialog[open]`);
    await dialog.screenshot({ path: resolve(preview.output, `${spec.key}-item-phone.png`) });
    await closeItem();
    await resetScroll(scope);
    await preview.capture(`${spec.key}-inventory-phone`);

    await page.setViewportSize({ width: 1680, height: 1050 });
    dialog = await openItem(weapon.id);
    await dialog.locator('[data-ci-action="open-item-sheet"]').click();
    assert.equal(await page.locator('#cp-tab-combat').evaluate(panel => panel.classList.contains('active')), true,
      `${spec.name}: item-card action must open the combat sheet`);
    assert.equal(await page.locator('#cp-name').inputValue(), character.name);
    await page.locator('#cp-combat-sheet-root .cp-combat-profile').waitFor();
    const visibleEquipment = await page.locator('#cp-combat-sheet-root [data-combat-property="name"]').evaluateAll(inputs => inputs
      .filter(input => ['weapons', 'armorItems'].includes(input.dataset.combatCollection))
      .map(input => ({ id: input.dataset.combatItemId, name: input.value })));
    for (const item of [...character.combatProfile.weapons, ...character.combatProfile.armorItems]) {
      assert.ok(visibleEquipment.some(visible => visible.id === item.id && visible.name === item.name), `${spec.name}: missing linked combat entry ${item.id}`);
      assert.ok(character.inventory.items.some(owned => owned.id === item.inventoryItemId));
    }
    const displayedArmorClass = await page.locator('[data-combat-derived="armor-class"]').innerText();
    if (spec.key === 'oweta-draig') {
      assert.equal(getArmorClass(sanitizeCharacterCombatProfile(character.combatProfile)), 15);
      assert.equal(Number(displayedArmorClass), 15);
    }
    await page.locator('#cp-combat-sheet-root [data-combat-collection="weapons"][data-combat-property="name"]').first().scrollIntoViewIfNeeded();
    await preview.capture(`${spec.key}-combat-desktop`);
    results.push({ key: spec.key, id: character.id, name: character.name, loadoutCount: loadout.length,
      ordinaryNames: names, companionNames, personalNames: personal.map(item => item.name), wallet,
      desktop, mobile, imageCount: images.length, images,
      visibleEquipment, displayedArmorClass });
    assert.deepEqual(await page.evaluate(() => _characters), characters, 'Viewing the profile must not mutate the prepared online records.');
  }
  assert.deepEqual(preview.errors, []);
  const report = { passed: true, starting, fixtureName, fixtureSha256: createHash('sha256').update(fixtureText).digest('hex'),
    externalWritesBlocked: true, saved: false, output: preview.output, artwork, results, errors: preview.errors };
  await writeFile(new URL(`${reportName}.json`, directory), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ ...report, results: results.map(({ images, ...result }) => result) }));
} catch (error) {
  await writeFile(new URL(`${reportName}-failure.json`, directory), JSON.stringify({ passed: false,
    fixtureSha256: createHash('sha256').update(fixtureText).digest('hex'), output: preview.output,
    externalWritesBlocked: true, error: error.stack, results, errors: preview.errors }, null, 2) + '\n');
  throw error;
} finally { await preview.close(); }
